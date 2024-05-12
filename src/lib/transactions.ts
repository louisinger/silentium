import { getBalance } from './wallet'
import { Wallet } from '../providers/wallet'
import { selectCoins } from './coinSelection'
import { buildPsbt } from './psbt'
import { signPsbt } from './signer'
import { Utxo } from './types'

export type sendSatsResult = {
  hex: string
  selectedCoins: Utxo[]
  newUtxos: Utxo[]
}

export async function sendSats(
  sats: number,
  destinationAddress: string,
  wallet: Wallet,
  mnemonic: string,
  feeRate: number,
): Promise<sendSatsResult> {
  // check if enough balance
  const utxos = wallet.utxos[wallet.network]
  const balance = getBalance(wallet)
  if (!balance || balance - sats < 0) throw new Error('Not enough balance')

  // select coins, build pset, sign it and broadcast it
  const coinSelection = selectCoins(sats, utxos, feeRate)
  const { psbt, walletOutputs } = await buildPsbt(coinSelection, destinationAddress, wallet, mnemonic)
  const signedPsbt = await signPsbt(psbt, coinSelection.coins, wallet.network, mnemonic)
  const tx = signedPsbt.finalizeAllInputs().extractTransaction()
  const txHex = tx.toHex()
  const txid = tx.getId()
  console.log('txHex', txHex)
  return { 
    hex: txHex,
    newUtxos: walletOutputs.map((utxo) => ({ ...utxo, txid })),
    selectedCoins: coinSelection.coins,
  }
}
