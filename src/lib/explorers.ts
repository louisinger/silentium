import { Wallet } from '../providers/wallet'
import { NetworkName } from './network'

export enum ExplorerName {
  Blockstream = 'Blockstream',
  Mempool = 'Mempool',
  Nigiri = 'Nigiri',
}

export interface ExplorerURLs {
  restApiExplorerURL: string
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
      restApiExplorerURL: 'https://blockstream.info/api/',
    },
    [NetworkName.Testnet]: {
      restApiExplorerURL: 'https://blockstream.info/testnet/api/',
    },
  },
  {
    name: ExplorerName.Mempool,
    [NetworkName.Mainnet]: {
      restApiExplorerURL: 'https://mempool.space/api/',
    },
  },
  {
    name: ExplorerName.Nigiri,
    [NetworkName.Regtest]: {
      restApiExplorerURL: 'http://localhost:3000',
    },
  },
]

export const getExplorerNames = (network: NetworkName) =>
  explorers.filter((e: Explorer) => e[network]).map((e) => e.name)

export const getRestApiExplorerURL = ({ explorer, network }: Wallet): string => {
  const exp = explorers.find((e) => e.name === explorer)
  if (!exp) throw new Error('Explorer not found')
  if (!exp[network]) throw new Error(`Explorer ${explorer} does not support ${network}`)
  const url = exp[network]?.restApiExplorerURL
  if (!url) throw new Error('Explorer URL not found')
  return url
}

export const getTxIdURL = (txid: string, wallet: Wallet) => {
  // stupid bug from mempool
  const url = getRestApiExplorerURL(wallet)
  return `${url}/tx/${txid}`
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
