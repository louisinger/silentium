import axios, { AxiosInstance, AxiosResponse } from 'axios';

type ScalarsResponse = AxiosResponse<{ scalars: string[] }>
type BlockFilterResponse = AxiosResponse<{ filter: string; blockhash: string }> 
type ChainTipHeightResponse = AxiosResponse<{ height: number }>

export interface BIP352BlockData {
    scalars: string[]
    filter: string
    blockhash: string
}

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

    async getBlockData(height: number): Promise<BIP352BlockData> {
        const [filter, scalars] = await Promise.all([
            this.getBlockFilter(height),
            this.getBlockScalars(height),
        ]);

        return {
            scalars: scalars.scalars,
            filter: filter.filter,
            blockhash: filter.blockhash,
        };
    }
    
    async getChainTipHeight(): Promise<number> {
        const resp = await this.axiosInstance.get<any, ChainTipHeightResponse>('/chain/tip')
        return resp.data.height
    }

    private async getBlockScalars(height: number): Promise<{ scalars: string[] }> {
        const resp = await this.axiosInstance.get<any, ScalarsResponse>(`/block/${height}/scalars`)
        return resp.data
    }

    private async getBlockFilter(height: number): Promise<{ filter: string; blockhash: string }> {
        const resp = await this.axiosInstance.get<any, BlockFilterResponse>(`/block/${height}/filter`)
        return resp.data
    }

}