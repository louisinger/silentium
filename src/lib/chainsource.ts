import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { Block } from 'bitcoinjs-lib'

export type ChainSourceUtxo = {
  txid: string
  vout: number
  value: number
}

export interface ChainSource {
  broadcast(txHex: string): Promise<string>
  getBlock(hash: string): Promise<Block>
  getBlockTime(hash: string): Promise<number>
  getChainTipHeight(): Promise<number>
  getFeeRates(): Promise<{ fastest: number; halfHour: number; hour: number, day: number }>
}

export class EsploraChainSource implements ChainSource {
  private axiosInstance: AxiosInstance

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      },
    })
  }

  async broadcast(txHex: string): Promise<string> {
    const resp = await this.axiosInstance.post<string, AxiosResponse<string>>('/tx', txHex, {
      headers: {
        'Content-Type': 'text/plain',
      },
    })
    return resp.data
  }

  async getBlock(hash: string): Promise<Block> {
    const resp = await this.axiosInstance.get<any, AxiosResponse<ArrayBuffer>>(`/block/${hash}/raw`, {
      responseType: 'arraybuffer',
      headers: {
        Accept: 'application/octet-stream',
        'Content-Type': 'application/octet-stream',
      },
    })
    return Block.fromBuffer(Buffer.from(resp.data))
  }

  async getBlockTime(hash: string): Promise<number> {
    const resp = await this.axiosInstance.get<any, AxiosResponse<{ timestamp: number }>>(`/block/${hash}`)
    return resp.data.timestamp
  }

  async getChainTipHeight(): Promise<number> {
    const resp = await this.axiosInstance.get<any, AxiosResponse<number>>('/blocks/tip/height')
    return resp.data
  }

  async getFeeRates(): Promise<{ fastest: number; halfHour: number; hour: number; day: number }> {
    const resp = await this.axiosInstance.get<any, AxiosResponse<Record<string, string>>>(
      '/fee-estimates'
    )
    
    return {
      fastest: parseFloat(resp.data['1']),
      halfHour: parseFloat(resp.data['3']),
      hour: parseFloat(resp.data['6']),
      day: parseFloat(resp.data['144']),
    }
  }
}
