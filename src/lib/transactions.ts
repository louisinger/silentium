import { getBalance } from './wallet'
import { Wallet } from '../providers/wallet'
import { selectCoins } from './coinSelection'
import { buildPsbt } from './psbt'
import { signPsbt } from './signer'

export async function sendSats(
  sats: number, 
  destinationAddress: string, 
  wallet: Wallet,
  mnemonic: string,
  feeRate: number,
): Promise<string> {
  // check if enough balance
  const utxos = wallet.utxos[wallet.network]
  const balance = getBalance(wallet)
  if (!balance || balance - sats < 0) throw new Error('Not enough balance')

  // select coins, build pset, sign it and broadcast it
  const coinSelection = selectCoins(sats, utxos, feeRate)
  const psbt = await buildPsbt(coinSelection, destinationAddress, wallet, mnemonic)
  const signedPsbt = await signPsbt(psbt, coinSelection.coins, wallet.network, mnemonic)
  const txHex = signedPsbt.finalizeAllInputs().extractTransaction().toHex()
  console.log('txHex', txHex)
  return txHex
}
