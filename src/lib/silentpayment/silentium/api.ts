import axios, { AxiosInstance, AxiosResponse } from 'axios';

type ScalarsResponse = AxiosResponse<{ scalars: string[] }>
type BlockFilterResponse = AxiosResponse<{ filter: string; blockhash: string }> 
type ChainTipHeightResponse = AxiosResponse<{ height: number }>

export class SilentiumAPI {
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string) {
        this.axiosInstance = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        });
     }


    async getBlockScalars(height: number): Promise<{ scalars: string[] }> {
        const resp = await this.axiosInstance.get<any, ScalarsResponse>(`/block/${height}/scalars`)
        return resp.data
    }

    async getBlockFilter(height: number): Promise<{ filter: string; blockhash: string }> {
        const resp = await this.axiosInstance.get<any, BlockFilterResponse>(`/block/${height}/filter`)
        return resp.data
    }

    async getChainTipHeight(): Promise<number> {
        const resp = await this.axiosInstance.get<any, ChainTipHeightResponse>('/chain/tip')
        return resp.data.height
    }
}