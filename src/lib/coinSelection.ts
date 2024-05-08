import { feeForCoins } from './fees'
import { Utxo } from './types'

const utxoValue = (u: Utxo) => u.value || 0

// coin selection strategy: accumulate utxos until value is achieved
const accumulativeStrategy = (target: number, coins: Utxo[]): Utxo[] => {
  let totalValue = 0
  const selectedCoins = []

  // push coins until target reached
  for (const coin of coins) {
    selectedCoins.push(coin)
    totalValue += utxoValue(coin)
    if (totalValue >= target) return selectedCoins
  }

  // not enough funds
  return []
}

// coin selection strategy: tries to get an exact value (no change)
const branchAndBoundStrategy = (target: number, coins: Utxo[]): Utxo[] | undefined => {
  const MAX_TRIES = 1_000
  const selected: number[] = []

  let backtrack
  let currTry = 0
  let currValue = 0
  let utxo_pool_index = 0

  // calculate total available value
  let totalValue = coins.reduce((acc: number, coin) => acc + utxoValue(coin), 0)

  // return undefined if we don't have enough funds
  if (totalValue < target) return

  // perform a depth-first search for choosing utxos
  while (currTry < MAX_TRIES) {
    // return if we found a working combination
    if (currValue == target) break

    // by default, don't backtrack
    backtrack = false

    // conditions for backtracking
    // 1. cannot reach target with remaining amount
    // 2. selected value is greater than upperbound
    if (currValue + totalValue < target || currValue > target) backtrack = true

    // backtrack if necessary
    if (backtrack) {
      // we walked back to first UTXO, all branches are traversed, we are done
      if (selected.length === 0) break

      // add omitted utxos back before traversing the omission branch of last included utxo
      utxo_pool_index -= 1
      while (utxo_pool_index > selected[selected.length - 1]) {
        totalValue += utxoValue(coins[utxo_pool_index])
        utxo_pool_index -= 1
      }

      // remove last included utxo from selected list
      currValue -= utxoValue(coins[utxo_pool_index])
      if (currValue < 0) return // something went wrong
      selected.pop()
    } else {
      // continue on this branch, add the next utxo to selected list
      let coin = coins[utxo_pool_index]

      // remove this utxo from total available amount
      totalValue -= utxoValue(coin)
      if (totalValue < 0) return // something went wrong

      // if this utxo is the first one or
      // if the previous index is included and therefore not relevant for exclusion shortcut
      if (selected.length === 0 || utxo_pool_index - 1 === selected[selected.length - 1]) {
        selected.push(utxo_pool_index)
        currValue += utxoValue(coin)
      }
    }

    currTry += 1
    utxo_pool_index += 1
  }

  // if we exhausted all tries, return undefined
  if (currTry >= MAX_TRIES) return

  // if no coins found, return undefined
  if (selected.length === 0) return

  // return the selected utxos
  return selected.map((i) => coins[i])
}

// select coins for given amount, with respective blinding private key
function sortAndSelect(amount: number, utxos: Utxo[]): Utxo[] {
  // sort utxos in descending order of value will decrease number of inputs
  // (and fees) but will increase utxo fragmentation
  const sortedUtxos = utxos.sort((a, b) => utxoValue(b) - utxoValue(a))
  // try to find a combination with exact value (aka no change) first
  return branchAndBoundStrategy(amount, sortedUtxos) ?? accumulativeStrategy(amount, sortedUtxos)
}

export interface CoinsSelected {
  amount: number
  changeAmount: number
  coins: Utxo[]
  txfee: number
}

export const selectCoins = (amount: number, utxos: Utxo[], feeRate: number): CoinsSelected => {
  // find best coins combo to pay this amount
  let changeAmount = 0,
    coins = utxos,
    numAttempts = 10,
    sats = amount,
    txfee = feeForCoins(utxos.length, 1, feeRate),
    value = 0

  const balance = coins.reduce((prev, curr) => prev + curr.value, 0)
  if (balance === sats + txfee) return { amount, changeAmount, coins, txfee }

  do {
    sats = sats - changeAmount // changeAmount is negative or 0
    coins = sortAndSelect(sats, utxos)
    value = coins.reduce((prev, curr) => prev + curr.value, 0)
    txfee = feeForCoins(coins.length, changeAmount > 0 ? 2 : 1, feeRate)
    changeAmount = value - sats - txfee
    numAttempts -= 1
  } while (changeAmount < 0 && numAttempts > 0)

  return { amount, changeAmount, coins, txfee }
}
