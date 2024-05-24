import { Transaction } from '@scure/btc-signer'
import { Wallet } from '../providers/wallet'
import { Utxo } from './types'
import { CoinsSelected } from './coinSelection'
import { getNetwork } from './network'
import { getCoinPrivKey, getP2TRAddress, getSilentPaymentAddress } from './wallet'
import * as silentpay from './silentpayment/core'

export type UtxoWithoutId = Pick<Utxo, 'script' | 'silentPayment' | 'value' | 'vout'>

export async function buildPsbt(
  coinSelection: CoinsSelected, 
  destinationAddress: string, 
  wallet: Wallet, 
  mnemonic: string
): Promise<{ psbt: Transaction, walletOutputs: UtxoWithoutId[] }> {
  const network = getNetwork(wallet.network)
  const { amount, changeAmount, coins } = coinSelection

  const outputs = []
  const silentPayRecipients: silentpay.RecipientAddress[] = []
  const walletOutputs: UtxoWithoutId [] = []

  if (silentpay.isSilentPaymentAddress(destinationAddress, network)) {
    silentPayRecipients.push({
      address: destinationAddress,
      amount,
    })
  } else {
    outputs.push({
      address: destinationAddress,
      value: amount,
    })

    const walletP2TR = getP2TRAddress(wallet)

    if (walletP2TR.address === destinationAddress) {
      walletOutputs.push({
        script: Buffer.from(walletP2TR.script).toString('hex'),
        value: amount,
        vout: 0,
      })
    }

  }

  if (changeAmount) {
    const changeAddress = getSilentPaymentAddress(wallet)
    silentPayRecipients.push({
      address: changeAddress,
      amount: changeAmount,
    })
  }

  const inputPrivKeys: silentpay.PrivateKey[] = await Promise.all(
    coins.map((coin: Utxo) => getCoinPrivKey(coin, wallet.network, mnemonic).then((key) => ({ key, isXOnly: true }))),
  )

  const smallestOutpointCoin = coins.slice(1).reduce((acc, coin) => {
    const comp = Buffer.from(coin.txid, 'hex').reverse().compare(Buffer.from(acc.txid, 'hex').reverse())
    if (comp < 0 || (comp === 0 && coin.vout < acc.vout)) return coin
    return acc
  }, coins[0])

  const [silentPayOutputs, tweaks] = silentpay.createOutputs(inputPrivKeys, smallestOutpointCoin, silentPayRecipients, network)

  if (getSilentPaymentAddress(wallet) === destinationAddress) {
    walletOutputs.push({
      script: silentPayOutputs[0].script.toString('hex'),
      value: amount,
      vout: 0,
      silentPayment: {
        tweak: tweaks[0],
      }
    })
  }

  if (changeAmount) {
    walletOutputs.push({
      script: silentPayOutputs[silentPayOutputs.length-1].script.toString('hex'),
      value: changeAmount,
      vout: 1,
      silentPayment: {
        tweak: tweaks[tweaks.length-1],
      }
    })
  }

  outputs.push(...silentPayOutputs)

  const psbt = new Transaction()

  for (const coin of coins) {
    psbt.addInput({
      txid: coin.txid,
      index: coin.vout,
      sighashType: 0,
      witnessUtxo: {
        amount: BigInt(coin.value),
        script: Buffer.from(coin.script, 'hex'),
      },
      tapInternalKey: coin.silentPayment
        ? Buffer.from(coin.script, 'hex').subarray(2)
        : Buffer.from(wallet.publicKeys[wallet.network].p2trPublicKey, 'hex').subarray(1),
    })
  }

  for (const output of outputs) {
    if ('address' in output) {
      psbt.addOutputAddress(output.address, BigInt(output.value), network)
    } else {
      psbt.addOutput({
        script: output.script,
        amount: BigInt(output.value),
      })
    }
  }
  
  return { psbt, walletOutputs }
}
