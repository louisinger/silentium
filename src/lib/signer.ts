import { Psbt, Transaction } from 'bitcoinjs-lib'
import { ECPairFactory } from 'ecpair'
import ecc from '@bitcoinerlab/secp256k1'
import { getCoinPrivKey } from './wallet'
import { Mnemonic, Utxo } from './types'
import { NetworkName } from './network'

const ECPair = ECPairFactory(ecc)

export async function signPsbt(partial: Psbt, coins: Utxo[], network: NetworkName, mnemonic: Mnemonic) {
  for (const [index] of partial.data.inputs.entries()) {
    const privateKey = await getCoinPrivKey(coins[index], network, mnemonic)
    partial.signInput(index, ECPair.fromPrivateKey(privateKey), [Transaction.SIGHASH_DEFAULT])
  }

  return partial
}