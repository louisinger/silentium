import { NETWORK, TEST_NETWORK} from '@scure/btc-signer'

export type Network = typeof NETWORK

export enum NetworkName {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
  Regtest = 'regtest',
}

export const getNetworkNames = (): [NetworkName, string][] => {
  return [
    [NetworkName.Mainnet, 'Mainnet'],
    [NetworkName.Testnet, 'Testnet'],
    [NetworkName.Regtest, 'Regtest'],
  ]
}

export const getNetwork = (network: NetworkName): Network => {
  const net = network.toLowerCase()
  if (net === 'mainnet') return NETWORK
  if (net === 'testnet') return TEST_NETWORK
  if (net === 'regtest') return TEST_NETWORK
  throw new Error(`Invalid network ${network}`)
}
