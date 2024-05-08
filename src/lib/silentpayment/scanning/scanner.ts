import * as secp from 'secp256k1'
import { BasicFilter } from 'bip158'
import { createTaggedHash, serialiseUint32 } from '../core/utils'

const taprootScriptPrefix = Buffer.from([0x51, 0x20])

// using block's scalars (inputHash * sumInputPubKeys) and BIP158 filter,
// scan for scripts that are included in the block.
export function scan(
  scanPrivateKey: Buffer,
  spendPublicKey: Buffer,
  scalars: Buffer[],
  basicFilter: BasicFilter,
): Map<string, Buffer> {
  // Map<Script, Scalar>
  const scripts = scalars.map((s) => computeScript(scanPrivateKey, spendPublicKey, 0, s))
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
  const ecdhSecret = secp.publicKeyTweakMul(
    Buffer.from(scalar),
    Buffer.from(scanPrivateKey), 
    true,
  )
  return createTaggedHash('BIP0352/SharedSecret', Buffer.concat([Buffer.from(ecdhSecret), serialiseUint32(counter)]))
}

export function computeScript(scanPrivateKey: Buffer, spendPublicKey: Buffer, counter: number, scalar: Buffer): Buffer {
  const tweak = computeTweak(scanPrivateKey, scalar, counter)
  const publicKey = secp.publicKeyTweakAdd(spendPublicKey, tweak, true)
  return Buffer.concat([taprootScriptPrefix, publicKey.slice(1)])
}
