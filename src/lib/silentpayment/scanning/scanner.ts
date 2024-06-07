import * as secp from '@noble/secp256k1'
import { compute_scripts } from 'bip352-tweaker'
import { BasicFilter } from 'bip158'
import { serialiseUint32 } from '../core/utils'
import { schnorr } from '@noble/curves/secp256k1'

const taprootScriptPrefix = Buffer.from([0x51, 0x20])

// using block's scalars (inputHash * sumInputPubKeys) and BIP158 filter,
// scan for scripts that are included in the block.
export function scan(
  scanPrivateKey: Buffer,
  spendPublicKey: Buffer,
  scalars: string[],
  basicFilter: BasicFilter,
): Map<string, string> {
  const scripts = compute_scripts(scanPrivateKey.toString('hex'), spendPublicKey.toString('hex'), 0, scalars)
  const inblock = basicFilter.filter(scripts.map(Buffer.from))

  const result = new Map<string, string>()
  for (const script of inblock) {
    const scalar = scalars.find((_, i) => script.equals(Buffer.from(scripts[i])))
    if (scalar) {
      result.set(script.toString('hex'), scalar)
    }
  }

  return result
}

export function computeTweak(scanPrivateKey: Buffer, scalar: Buffer, counter: number): Buffer {
  const ecdhSecret = secp.getSharedSecret(scanPrivateKey, scalar, true)
  return Buffer.from(schnorr.utils.taggedHash('BIP0352/SharedSecret', Buffer.concat([Buffer.from(ecdhSecret), serialiseUint32(counter)])))
}

export function computeScript(scanPrivateKey: Buffer, spendPublicKey: Buffer, counter: number, scalar: Buffer): Buffer {
  const spendPoint = secp.ProjectivePoint.fromHex(spendPublicKey)
  const tweak = computeTweak(scanPrivateKey, scalar, counter)

  const publicKey = spendPoint
    .add(secp.ProjectivePoint.fromPrivateKey(tweak))
    .toRawBytes(true)
  
  return Buffer.concat([taprootScriptPrefix, publicKey.slice(1)])
}
