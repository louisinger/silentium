import ecc from '@bitcoinerlab/secp256k1'
import { mnemonicToSeed } from 'bip39'
import BIP32Factory, { BIP32Interface } from 'bip32'
import { Mnemonic, Satoshis, Utxo, PublicKeys, Keys } from './types'
import { NetworkName, getNetwork } from './network'
import { Wallet } from '../providers/wallet'
import { deriveBIP352Keys } from './silentpayment/core/keys'
import { encodeSilentPaymentAddress } from './silentpayment/core/encoding'
import { initEccLib, payments } from 'bitcoinjs-lib'

const bip32 = BIP32Factory(ecc)

initEccLib(ecc)

export async function getCoinPrivKey(coin: Utxo, network: NetworkName, mnemonic: string): Promise<Buffer> {
  const seed = await mnemonicToSeed(mnemonic)
  if (!seed) throw new Error('Could not get seed from mnemonic')
  const masterNode = bip32.fromSeed(seed)

  if (coin.silentPayment) {
    const { spend } = deriveBIP352Keys(masterNode, network === NetworkName.Mainnet)
    const privKey = spend.privateKey
    if (!privKey) throw new Error('Could not derive private key')
    const tweakedKey = ecc.privateAdd(privKey, Buffer.from(coin.silentPayment.tweak, 'hex'))
    if (!tweakedKey) throw new Error('Could not tweak private key')
    return Buffer.from(tweakedKey)
  }

  const { p2trPrivateKey } = getP2TRPrivateKey(masterNode, network)
  return p2trPrivateKey
}

const getSilentPaymentPublicKeys = (
  master: BIP32Interface,
  network: NetworkName,
): { scanPublicKey: string; spendPublicKey: string } => {
  const { scan, spend } = deriveBIP352Keys(master, network === NetworkName.Mainnet)
  return { scanPublicKey: scan.publicKey.toString('hex'), spendPublicKey: spend.publicKey.toString('hex') }
}

const getP2TRPublicKey = (master: BIP32Interface, network: NetworkName): { p2trPublicKey: string } => {
  const coinType = network === NetworkName.Mainnet ? 0 : 1
  const key = master.deriveHardened(86).deriveHardened(coinType).deriveHardened(0).derive(0).derive(0)
  return { p2trPublicKey: key.publicKey.toString('hex') }
}

const getP2TRPrivateKey = (master: BIP32Interface, network: NetworkName): { p2trPrivateKey: Buffer } => {
  const coinType = network === NetworkName.Mainnet ? 0 : 1
  const key = master.deriveHardened(86).deriveHardened(coinType).deriveHardened(0).derive(0).derive(0)
  if (!key.privateKey) throw new Error('Could not derive private key')
  return { p2trPrivateKey: key.privateKey }
}

const getPublicKeys = (master: BIP32Interface, network: NetworkName): Keys => ({
  ...getSilentPaymentPublicKeys(master, network),
  ...getP2TRPublicKey(master, network),
})

export async function getSilentPaymentScanPrivateKey(mnemonic: string, network: NetworkName): Promise<Buffer> {
  const seed = await mnemonicToSeed(mnemonic)
  const master = bip32.fromSeed(seed)
  const { scan } = deriveBIP352Keys(master, network === NetworkName.Mainnet)
  if (!scan.privateKey) throw new Error('Could not derive private key')
  return scan.privateKey
}

export const getKeys = async (mnemonic: Mnemonic): Promise<PublicKeys> => {
  const seed = await mnemonicToSeed(mnemonic)
  if (!seed) throw new Error('Could not get seed from mnemonic')
  const master = bip32.fromSeed(seed)
  return {
    [NetworkName.Mainnet]: getPublicKeys(master, NetworkName.Mainnet),
    [NetworkName.Regtest]: getPublicKeys(master, NetworkName.Regtest),
    [NetworkName.Testnet]: getPublicKeys(master, NetworkName.Testnet),
  }
}

export const getBalance = (wallet: Wallet): Satoshis => {
  const utxos = wallet.utxos[wallet.network]
  if (!utxos) return 0
  return utxos.reduce((prev, curr) => prev + curr.value, 0)
}

export const getUtxos = (wallet: Wallet): Utxo[] => {
  const utxos = wallet.utxos[wallet.network]
  return utxos ?? []
}

export function getSilentPaymentAddress(wallet: Wallet): string {
  const { scanPublicKey, spendPublicKey } = wallet.publicKeys[wallet.network]

  return encodeSilentPaymentAddress(
    Buffer.from(scanPublicKey, 'hex'),
    Buffer.from(spendPublicKey, 'hex'),
    getNetwork(wallet.network),
  )
}

export function getP2TRAddress(wallet: Wallet): string {
  const p2tr = payments.p2tr({
    network: getNetwork(wallet.network),
    pubkey: Buffer.from(wallet.publicKeys[wallet.network].p2trPublicKey, 'hex').slice(1),
  })

  if (!p2tr.address) throw new Error('Could not generate P2TR address')

  return p2tr.address
}

export function isInitialized(wallet: Wallet): boolean {
  return (
    wallet.publicKeys[wallet.network].scanPublicKey !== '' &&
    wallet.publicKeys[wallet.network].spendPublicKey !== '' &&
    wallet.publicKeys[wallet.network].p2trPublicKey !== ''
  )
}
