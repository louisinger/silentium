import Decimal from 'decimal.js'

const vbyteSize = (numInputs: number, numOutputs: number) => (numInputs * 57.5 + numOutputs * 43) + 10.5

export const feeForCoins = (numInputs: number, numOutputs: number, feeRate: number) => Decimal.ceil(Decimal.mul(vbyteSize(numInputs, numOutputs), feeRate)).toNumber()
