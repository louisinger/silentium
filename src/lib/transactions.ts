import { Wallet } from '../providers/wallet'
import { CoinsSelected } from './coinSelection'
import { buildPsbt } from './psbt'
import { signPsbt } from './signer'
import { Utxo } from './types'

export type sendSatsResult = {
  hex: string
  newUtxos: Utxo[]
}

export async function sendSats(
  destinationAddress: string,
  coinsSelected: CoinsSelected,
  wallet: Wallet,
  mnemonic: string,
): Promise<sendSatsResult> {
  const { psbt, walletOutputs } = await buildPsbt(coinsSelected, destinationAddress, wallet, mnemonic)
  const signedPsbt = await signPsbt(psbt, coinsSelected.coins, wallet.network, mnemonic)
  const tx = signedPsbt.finalizeAllInputs().extractTransaction()
  const txHex = tx.toHex()
  const txid = tx.getId()
  console.log('txHex', txHex)
  return { 
    hex: txHex,
    newUtxos: walletOutputs.map((utxo) => ({ ...utxo, txid })),
  }
}
