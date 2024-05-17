import * as secp from 'secp256k1'
import ecc from '@bitcoinerlab/secp256k1'
import { Outpoint, PrivateKey } from './types'
import { createHash } from 'crypto'

export const createInputHash = (sumOfInputPublicKeys: Buffer, outpoint: Outpoint): Buffer => {
  return createTaggedHash(
    'BIP0352/Inputs',
    Buffer.concat([
      Buffer.concat([Buffer.from(outpoint.txid, 'hex').reverse(), serialiseUint32LE(outpoint.vout)]),
      sumOfInputPublicKeys,
    ]),
  )
}

export const createTaggedHash = (tag: string, buffer: Buffer): Buffer => {
  const tagHash = createHash('sha256').update(tag, 'utf8').digest()
  return createHash('sha256').update(tagHash).update(tagHash).update(buffer).digest()
}

export const calculateSumOfPrivateKeys = (keys: PrivateKey[]): Buffer => {
  if (!keys.length) throw new Error('failed to get input private keys')
  const negatedKeys = keys.map(({ isXOnly, key }) => {
    if (isXOnly && getPublicKey(key)[0] === 0x03) {
      return Buffer.from(secp.privateKeyNegate(key))
    }
    return key
  })

  if (negatedKeys.length === 1) {
    return negatedKeys[0]
  }

  return Buffer.from(
    negatedKeys.slice(1).reduce((acc, key) => Buffer.from(ecc.privateAdd(acc, key)!), negatedKeys[0]),
  )
}

export const serialiseUint32 = (n: number): Buffer => {
  const buf = Buffer.alloc(4)
  buf.writeUInt32BE(n)
  return buf
}

const serialiseUint32LE = (n: number): Buffer => {
  const buf = Buffer.alloc(4)
  buf.writeUInt32LE(n)
  return buf
}

export const readVarInt = (buffer: Buffer, offset: number = 0): number => {
  const first = buffer.readUInt8(offset)

  // 8 bit
  if (first < 0xfd) return first
  // 16 bit
  else if (first === 0xfd) return buffer.readUInt16LE(offset + 1)
  // 32 bit
  else if (first === 0xfe) return buffer.readUInt32LE(offset + 1)
  // 64 bit
  else {
    const lo = buffer.readUInt32LE(offset + 1)
    const hi = buffer.readUInt32LE(offset + 5)
    return hi * 0x0100000000 + lo
  }
}

export const encodingLength = (n: number) => {
  return n < 0xfd ? 1 : n <= 0xffff ? 3 : n <= 0xffffffff ? 5 : 9
}

export const getPublicKey = (privateKey: Buffer): Buffer => {
  const point = secp.publicKeyCreate(privateKey, true)
  return Buffer.from(point)
}
