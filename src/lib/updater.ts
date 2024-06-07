import { BasicFilter } from 'bip158'
import { ChainSource } from './chainsource'
import { BIP352BlockData } from './silentpayment/silentium/api'
import { Transaction, Utxo } from './types'
import { scan, computeScript, computeTweak } from '../lib/silentpayment/scanning'
import { Wallet } from '../providers/wallet'

type UpdateResult = {
  spentUtxos: { txid: string; vout: number }[]
  newUtxos: Utxo[]
  transactions: Transaction[]
}

export class Updater {
  constructor(
    private chainSource: ChainSource,
    private scanPrivateKey: Buffer,
    private spendPublicKey: Buffer,
    private p2trScript: Buffer,
  ) {}

  async updateHeight(blockData: BIP352BlockData, currentUtxos: Utxo[], mempoolTxs: Transaction[]): Promise<UpdateResult> {
    const { scalars, filter, blockhash } = blockData
    const basicFilter = new BasicFilter(blockhash, filter)

    const scriptsInBlock = scan(this.scanPrivateKey, this.spendPublicKey, scalars, basicFilter)

    const silentPayUtxosScripts = currentUtxos
      .filter((utxo) => utxo.silentPayment !== undefined)
      .map((utxo) => h2b(utxo.script))

    const silentPaySpentInBlock = basicFilter.filter(silentPayUtxosScripts).map(b2h)
    const p2trInBlock = basicFilter.match(this.p2trScript)

    if (!p2trInBlock && silentPaySpentInBlock.length === 0 && scriptsInBlock.size === 0) {
      return {
        spentUtxos: [],
        newUtxos: [],
        transactions: [],
      }
    }

    const block = await this.chainSource.getBlock(blockhash)
    if (!block.transactions || block.transactions.length === 0) {
      throw new Error('Block has no transactions')
    }

    const spentScriptsToFind = new Set(silentPaySpentInBlock)
    const fundedScriptsToFind = new Set(scriptsInBlock.keys())

    const result: UpdateResult = {
      spentUtxos: [],
      newUtxos: [],
      transactions: [],
    }
    
    const blockTimestamp = await this.chainSource.getBlockTime(blockhash)

    for (const tx of block.transactions) {
      if (spentScriptsToFind.size === 0 && fundedScriptsToFind.size === 0 && !p2trInBlock) {
        break
      }

      const txid = tx.getId()

      const knownTx = mempoolTxs.find((t) => t.txid === txid)
      if (knownTx) {
        result.transactions.push(knownTx)
        continue
      }

      const txInfo: Transaction = {
        amount: 0,
        txid: tx.getId(),
        unixdate: blockTimestamp,
      }
      let isWalletTx = false

      for (const input of tx.ins) {
        if (spentScriptsToFind.size === 0 && !p2trInBlock) {
          break
        }

        const inputTxid = Buffer.from(input.hash).reverse().toString('hex') 
        const foundUtxo = currentUtxos.find((utxo) => utxo.txid === inputTxid && utxo.vout === input.index)
        if (!foundUtxo) continue

        spentScriptsToFind.delete(foundUtxo.script)
        result.spentUtxos.push({ txid: foundUtxo.txid, vout: foundUtxo.vout })
        txInfo.amount -= foundUtxo.value
        isWalletTx = true
      }

      for (const [vout, output] of tx.outs.entries()) {
        if (fundedScriptsToFind.size === 0 && !p2trInBlock) {
          break
        }

        if (p2trInBlock && output.script.equals(this.p2trScript)) {
          result.newUtxos.push({
            txid: tx.getId(),
            vout,
            script: output.script.toString('hex'),
            value: output.value,
          })
          txInfo.amount += output.value
          isWalletTx = true
          continue
        }

        const script = b2h(output.script)

        if (fundedScriptsToFind.has(script)) {
          const scalar = scriptsInBlock.get(script)!

          result.newUtxos.push({
            txid: tx.getId(),
            vout,
            script: output.script.toString('hex'),
            value: output.value,
            silentPayment: {
              tweak: computeTweak(this.scanPrivateKey, h2b(scalar), 0).toString('hex'),
            },
          })
          txInfo.amount += output.value
          isWalletTx = true
          fundedScriptsToFind.delete(script)

          let nextCounter = 1
          let nextScript = computeScript(this.scanPrivateKey, this.spendPublicKey, nextCounter, h2b(scalar))

          for (let i = vout + 1; i < tx.outs.length; i++) {
            if (tx.outs[i].script.equals(nextScript)) {
              result.newUtxos.push({
                txid: tx.getId(),
                vout: i,
                script: tx.outs[i].script.toString('hex'),
                value: tx.outs[i].value,
                silentPayment: {
                  tweak: computeTweak(this.scanPrivateKey, h2b(scalar), nextCounter).toString('hex'),
                },
              })
              isWalletTx = true
              txInfo.amount += tx.outs[i].value

              nextCounter++
              nextScript = computeScript(this.scanPrivateKey, this.spendPublicKey, nextCounter, h2b(scalar))
            }
          }
        }
      }

      if (isWalletTx) {
        result.transactions.push(txInfo)
      }
    }

    return result
  }
}

export function applyUpdate(wallet: Wallet, update: UpdateResult): Wallet {
  let newUtxoState = wallet.utxos[wallet.network]

  for (const spent of update.spentUtxos) {
    newUtxoState = newUtxoState.filter((utxo) => utxo.txid !== spent.txid || utxo.vout !== spent.vout)
  }

  for (const newUtxo of update.newUtxos) {
    const found = newUtxoState.find((utxo) => utxo.txid === newUtxo.txid && utxo.vout === newUtxo.vout)
    if (!found) newUtxoState.push(newUtxo)  
  }

  
  let newTxs = wallet.transactions[wallet.network]
  for (const tx of update.transactions) {
    if (!newTxs.find((t) => t.txid === tx.txid)) {
      newTxs.push(tx)
    }
  }

  let newUncomfirmedTxs = wallet.mempoolTransactions[wallet.network].filter((tx) => {
    return !update.transactions.find((t) => t.txid === tx.txid)
  })

  return {
    ...wallet,
    utxos: {
      ...wallet.utxos,
      [wallet.network]: newUtxoState,
    },
    transactions: {
      ...wallet.transactions,
      [wallet.network]: newTxs,
    },
    mempoolTransactions: {
      ...wallet.mempoolTransactions,
      [wallet.network]: newUncomfirmedTxs,
    },
  }
}

function b2h(b: Buffer): string {
  return b.toString('hex')
}

function h2b(h: string): Buffer {
  return Buffer.from(h, 'hex')
}
