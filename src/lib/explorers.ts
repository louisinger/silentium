import { Wallet } from '../providers/wallet'
import { NetworkName } from './network'

export enum ExplorerName {
  Blockstream = 'Blockstream',
  Mempool = 'Mempool',
  Nigiri = 'Nigiri',
}

export interface ExplorerURLs {
  rest: string
  web: string
}

export interface Explorer {
  name: ExplorerName
  [NetworkName.Mainnet]?: ExplorerURLs
  [NetworkName.Testnet]?: ExplorerURLs
  [NetworkName.Regtest]?: ExplorerURLs
}

const explorers: Explorer[] = [
  {
    name: ExplorerName.Blockstream,
    [NetworkName.Mainnet]: {
      rest: 'https://blockstream.info/api/',
      web: 'https://blockstream.info/',
    },
    [NetworkName.Testnet]: {
      rest: 'https://blockstream.info/testnet/api/',
      web: 'https://blockstream.info/testnet/',
    },
  },
  {
    name: ExplorerName.Mempool,
    [NetworkName.Mainnet]: {
      rest: 'https://mempool.space/api/',
      web: 'https://mempool.space/',
    },
  },
  {
    name: ExplorerName.Nigiri,
    [NetworkName.Regtest]: {
      rest: 'http://localhost:3000',
      web: 'http://localhost:3000',
    },
  },
]

export const getExplorerNames = (network: NetworkName) =>
  explorers.filter((e: Explorer) => e[network]).map((e) => e.name)

export const getRestApiExplorerURL = ({ explorer, network }: Wallet): string => {
  const exp = explorers.find((e) => e.name === explorer)
  if (!exp) throw new Error('Explorer not found')
  if (!exp[network]) throw new Error(`Explorer ${explorer} does not support ${network}`)
  const url = exp[network]?.rest
  if (!url) throw new Error('Explorer URL not found')
  return url
}

const getWebExplorerURL = ({ explorer, network }: Wallet): string => {
  const exp = explorers.find((e) => e.name === explorer)
  if (!exp) throw new Error('Explorer not found')
  if (!exp[network]) throw new Error(`Explorer ${explorer} does not support ${network}`)
  const url = exp[network]?.web
  if (!url) throw new Error('Explorer URL not found')
  return url
}

export const getTxIdURL = (txid: string, wallet: Wallet) => {
  const url = getWebExplorerURL(wallet)
  return new URL(`/tx/${txid}`, url).toString()
}

export const openInNewTab = (txid: string, wallet: Wallet) => {
  window.open(getTxIdURL(txid, wallet), '_blank', 'noreferrer')
}

export interface AddressInfo {
  address: string
  chain_stats: {
    funded_txo_count: number
    spent_txo_count: number
    tx_count: number
  }
  mempool_stats: {
    funded_txo_count: number
    spent_txo_count: number
    tx_count: number
  }
}

export const fetchAddress = async (address: string, wallet: Wallet): Promise<AddressInfo> => {
  const url = `${getRestApiExplorerURL(wallet)}/api/address/${address}`
  const response = await fetch(url)
  return await response.json()
}

export interface AddressTxInfo {
  txid: string
  version: number
  locktime: number
  vin: [any]
  vout: [any]
  size: number
  weight: number
  fee: number
  status: {
    confirmed: boolean
    block_height: number
    block_hash: string
    block_time: number
  }
}

export const fetchTxHex = async (txid: string, wallet: Wallet): Promise<string> => {
  const url = `${getRestApiExplorerURL(wallet)}/api/tx/${txid}/hex`
  const response = await fetch(url)
  return await response.text()
}
