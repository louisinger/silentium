import { Transaction } from '@scure/btc-signer'
import { getCoinPrivKey } from './wallet'
import { Mnemonic, Utxo } from './types'
import { NetworkName } from './network'

export async function signPsbt(tx: Transaction, coins: Utxo[], network: NetworkName, mnemonic: Mnemonic) {
  for (let i = 0; i < tx.inputsLength; i++) {
    const coin = coins[i]
    const privateKey = await getCoinPrivKey(coin, network, mnemonic)

    if (!tx.signIdx(
      privateKey,
      i,
      [0x00]
    )) {
      throw new Error('Could not sign input')
    }
  }

  return tx
}