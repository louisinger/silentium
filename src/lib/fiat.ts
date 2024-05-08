import { extractError } from './error'
import { verify } from './schnorr'

export interface FiatPrices {
  eur: number
  usd: number
}

export interface OracleResponse {
  pricefeed: FiatPrices
  timestamp: number
  publickey: string
  signature: string
}

const OraclePubKey = '4ad3c85200b879c123fd5682d91b476d57aaea3c7508d30ec64a19f4c9705ecf'

export const getPriceFeed = async (): Promise<FiatPrices | undefined> => {
  try {
    const { pricefeed, timestamp, publickey, signature }: OracleResponse = await fetch(
      'https://btcoracle.bordalix.workers.dev/',
    ).then((res) => res.json())
    const data = { pricefeed, timestamp, publickey }
    if (!signature) throw new Error('Missing signature')
    if (publickey !== OraclePubKey) throw new Error('Invalid public key')
    if (!verify(data, publickey, signature)) throw new Error('Invalid signature')
    return pricefeed
  } catch (err) {
    console.log('error fetching fiat prices:', extractError(err))
  }
}
