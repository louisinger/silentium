import { NetworkName } from './network'

export type Mnemonic = string
export type Password = string
export type Satoshis = number

export type DecodedAddress = { script: Buffer }

export type NextIndex = number

export type Transaction = {
  amount: number
  txid: string
  unixdate: number
}
export type Transactions = Record<NetworkName, Transaction[]>

export type Utxo = {
  txid: string
  vout: number
  value: number
  script: string
  silentPayment?: {
    tweak: string
  }
}

export type Utxos = Record<NetworkName, Utxo[]>

export type Keys = {
  scanPublicKey: string
  spendPublicKey: string
  p2trPublicKey: string
}

export type PublicKeys = Record<NetworkName, Keys>
