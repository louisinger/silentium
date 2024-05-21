import * as ecc from '@noble/secp256k1'
import { HDKey } from '@scure/bip32'
import { mnemonicToSeed } from '@scure/bip39'
import { p2tr, p2tr_pk } from '@scure/btc-signer'
import { Mnemonic, Satoshis, Utxo, PublicKeys, Keys } from './types'
import { NetworkName, getNetwork } from './network'
import { Wallet } from '../providers/wallet'
import { deriveBIP352Keys } from './silentpayment/core/keys'
import { encodeSilentPaymentAddress } from './silentpayment/core/encoding'
import { schnorr } from '@noble/curves/secp256k1'

export async function getCoinPrivKey(coin: Utxo, network: NetworkName, mnemonic: string): Promise<Buffer> {
  const seed = await mnemonicToSeed(mnemonic)
  if (!seed) throw new Error('Could get seed from mnemonic')
  const masterNode = HDKey.fromMasterSeed(seed)

  if (coin.silentPayment) {
    const { spend } = deriveBIP352Keys(masterNode, network === NetworkName.Mainnet)
    const privKey = ecc.ProjectivePoint
      .fromPrivateKey(spend.privateKey!)
      .add(ecc.ProjectivePoint.fromHex(coin.silentPayment.tweak))
    return Buffer.from(privKey.toRawBytes(true))
  }

  const { p2trPublicKey } = getP2TRPublicKey(masterNode, network)
  if (coin.script.includes(p2trPublicKey)) {
    return getP2TRPrivateKey(masterNode, network, false).p2trPrivateKey
  }

  return getP2TRPrivateKey(masterNode, network, true).p2trPrivateKey
}

const getSilentPaymentPublicKeys = (
  master: HDKey,
  network: NetworkName,
): { scanPublicKey: string; spendPublicKey: string } => {
  const { scan, spend } = deriveBIP352Keys(master, network === NetworkName.Mainnet)
  return { scanPublicKey: Buffer.from(scan.publicKey!).toString('hex'), spendPublicKey: Buffer.from(spend.publicKey!).toString('hex') }
}

const getP2TRPublicKey = (master: HDKey, network: NetworkName): { p2trPublicKey: string } => {
  const coinType = network === NetworkName.Mainnet ? 0 : 1
  const key = master.derive(`m/86'/${coinType}'/0'/0/0`).publicKey
  if (!key) throw new Error('Could not derive public key')
  return { p2trPublicKey: Buffer.from(key).toString('hex') }
}

const getP2TRPrivateKey = (master: HDKey, network: NetworkName, tweaked: boolean): { p2trPrivateKey: Buffer } => {
  const coinType = network === NetworkName.Mainnet ? 0 : 1
  const key = master.derive(`m/86'/${coinType}'/0'/0/0`)
  if (!key.privateKey) throw new Error('Could not derive private key')
  if (!key.publicKey) throw new Error('Could not derive public key')
  
  if (!tweaked) {
    return {
      p2trPrivateKey:  Buffer.from(key.privateKey),
    }
  }
    
  const tweak = schnorr.utils.taggedHash('TapTweak', Buffer.from(key.publicKey).subarray(1))
  const hasOddY = key.publicKey[0] === 3 || (key.publicKey[0] === 4 && (key.publicKey[64] & 1) === 1);
  let privKey = key.privateKey;
  if (hasOddY) {
    const negated = ecc.ProjectivePoint.fromPrivateKey(privKey).negate();
    if (!negated) throw new Error('Could not negate private key');
    privKey = Buffer.from(negated.toRawBytes(true));
  }

  const tweakedPrivateKey = ecc.ProjectivePoint.fromPrivateKey(privKey).add(ecc.ProjectivePoint.fromHex(tweak));
  return { p2trPrivateKey: Buffer.from(tweakedPrivateKey.toRawBytes(true)) }
}

const getPublicKeys = (master: HDKey, network: NetworkName): Keys => ({
  ...getSilentPaymentPublicKeys(master, network),
  ...getP2TRPublicKey(master, network),
})

export async function getSilentPaymentScanPrivateKey(mnemonic: string, network: NetworkName): Promise<Buffer> {
  const seed = await mnemonicToSeed(mnemonic)
  const master = HDKey.fromMasterSeed(seed)
  const { scan } = deriveBIP352Keys(master, network === NetworkName.Mainnet)
  if (!scan.privateKey) throw new Error('Could not derive private key')
  return Buffer.from(scan.privateKey)
}

export const getKeys = async (mnemonic: Mnemonic): Promise<PublicKeys> => {
  const seed = await mnemonicToSeed(mnemonic)
  if (!seed) throw new Error('Could not get seed from mnemonic')
  const master = HDKey.fromMasterSeed(seed)
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

export function getP2TRAddress(wallet: Wallet): ReturnType<typeof p2tr_pk> {
  return p2tr(
    wallet.publicKeys[wallet.network].p2trPublicKey.slice(2),
    undefined,
    getNetwork(wallet.network),
  )
}

export function isInitialized(wallet: Wallet): boolean {
  return (
    wallet.publicKeys[wallet.network].scanPublicKey !== '' &&
    wallet.publicKeys[wallet.network].spendPublicKey !== '' &&
    wallet.publicKeys[wallet.network].p2trPublicKey !== ''
  )
}
