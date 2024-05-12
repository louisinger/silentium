import { Psbt, address } from 'bitcoinjs-lib'
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
): Promise<{ psbt: Psbt, walletOutputs: UtxoWithoutId[] }> {
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

    if (getP2TRAddress(wallet) === destinationAddress) {
      walletOutputs.push({
        script: address.toOutputScript(destinationAddress, getNetwork(wallet.network)).toString('hex'),
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

  const psbt = new Psbt({ network })
    .addInputs(
      coins.map((coin: Utxo) => ({
        hash: coin.txid,
        index: coin.vout,
        witnessUtxo: {
          script: Buffer.from(coin.script, 'hex'),
          value: coin.value,
        },
        tapInternalKey: Buffer.from(coin.script, 'hex').slice(2),
      })),
    )
    .addOutputs(outputs)


  return { psbt, walletOutputs }
}
