import { schnorr } from '@noble/curves/secp256k1'

const fromHex = (hexString: string): Uint8Array => {
  const aux = hexString.match(/.{1,2}/g)
  if (aux) return new Uint8Array(aux.map((byte) => parseInt(byte, 16)))
  throw new Error('Error decoding hex string')
}

export const verify = (data: any, publickey: string, signature: string): boolean => {
  const pub = fromHex(publickey)
  const sig = fromHex(signature)
  const msg = new TextEncoder().encode(JSON.stringify(data))
  return schnorr.verify(sig, msg, pub)
}
