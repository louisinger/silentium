import * as secp from '@noble/secp256k1'
import { BasicFilter } from 'bip158'
import { serialiseUint32 } from '../core/utils'
import { schnorr } from '@noble/curves/secp256k1'

const taprootScriptPrefix = Buffer.from([0x51, 0x20])

// using block's scalars (inputHash * sumInputPubKeys) and BIP158 filter,
// scan for scripts that are included in the block.
export function scan(
  scanPrivateKey: Buffer,
  spendPublicKey: Buffer,
  scalars: Buffer[],
  basicFilter: BasicFilter,
): Map<string, Buffer> {
  const spendPoint = secp.ProjectivePoint.fromHex(spendPublicKey)
  // Map<Script, Scalar>
  const scripts = scalars.map((s) => computeScriptFromPoint(scanPrivateKey, spendPoint, 0, s))
  const inblock = basicFilter.filter(scripts).map((s) => s.toString('hex'))

  const result = new Map<string, Buffer>()
  for (const script of inblock) {
    const scalar = scalars.find((_, i) => script === scripts[i].toString('hex'))
    if (scalar) {
      result.set(script, scalar)
    }
  }

  return result
}

export function computeTweak(scanPrivateKey: Buffer, scalar: Buffer, counter: number): Buffer {
  const ecdhSecret = secp.getSharedSecret(scanPrivateKey, scalar, true)
  return Buffer.from(schnorr.utils.taggedHash('BIP0352/SharedSecret', Buffer.concat([Buffer.from(ecdhSecret), serialiseUint32(counter)])))
}

export function computeScript(scanPrivateKey: Buffer, spendPublicKey: Buffer, counter: number, scalar: Buffer): Buffer {
  return computeScriptFromPoint(scanPrivateKey, secp.ProjectivePoint.fromHex(spendPublicKey), counter, scalar)
}

export function computeScriptFromPoint(scanPrivateKey: Buffer, spendPoint: secp.ProjectivePoint, counter: number, point: Buffer): Buffer {
  const tweak = computeTweak(scanPrivateKey, point, counter)

  const publicKey = spendPoint
    .add(secp.ProjectivePoint.fromPrivateKey(tweak))
    .toRawBytes(true)
  
  return Buffer.concat([taprootScriptPrefix, publicKey.slice(1)])
}