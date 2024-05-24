import * as ecc from '@bitcoinerlab/secp256k1'
import { Transaction } from '@scure/btc-signer'
import { getCoinPrivKey } from './wallet'
import { Mnemonic, Utxo } from './types'
import { NetworkName } from './network'

const auxRand = Buffer.alloc(32)

export async function signPsbt(tx: Transaction, coins: Utxo[], network: NetworkName, mnemonic: Mnemonic) {
  const prevoutScripts = []
  const prevoutAmounts = []

  for (let i = 0; i < tx.inputsLength; i++) {
    const witnessUtxo = tx.getInput(i).witnessUtxo
    if (!witnessUtxo) {
      throw new Error(`Input ${i} does not have a witnessUtxo`)
    }
    
    prevoutScripts.push(witnessUtxo.script)
    prevoutAmounts.push(witnessUtxo.amount)
  }

  for (let i = 0; i < tx.inputsLength; i++) {
    const coin = coins[i]
    const privateKey = await getCoinPrivKey(coin, network, mnemonic)

    const msg = tx.preimageWitnessV1(i, prevoutScripts, 0x00, prevoutAmounts)
    const sig = ecc.signSchnorr(msg, privateKey, auxRand)
    tx.updateInput(i, {
      tapKeySig: sig,
    })
  }

  return tx
}