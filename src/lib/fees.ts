import Decimal from 'decimal.js'
import { selectCoins } from './coinSelection'
import { Wallet } from '../providers/wallet'

const vbyteSize = (numInputs: number, numOutputs: number) => (numInputs * 57.5 + numOutputs * 43) + 10.5

export const feeForCoins = (numInputs: number, numOutputs: number, feeRate: number) => Decimal.ceil(Decimal.mul(vbyteSize(numInputs, numOutputs), feeRate)).toNumber()

export const feesToSendSats = (sats: number, wallet: Wallet, feeRate: number): number => {
  if (sats === 0) return 0
  const { coins, changeAmount } = selectCoins(sats, 
    wallet.utxos[wallet.network], 
    feeRate
  )

  return feeForCoins(coins.length, changeAmount > 0 ? 2 : 1, feeRate)
}
