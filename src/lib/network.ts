import { Network, networks } from 'bitcoinjs-lib'

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
  if (net === 'mainnet') return networks.bitcoin
  if (net === 'testnet') return networks.testnet
  if (net === 'regtest') return networks.regtest
  throw new Error(`Invalid network ${network}`)
}
