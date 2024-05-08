export type RecipientAddress = {
    address: string;
    amount: number;
};

export type PrivateKey = {
    key: Buffer;
    isXOnly: boolean;
}

export type Outpoint = {
    txid: string;
    vout: number;
};

export type Output = {
    script: Buffer;
    value: number;
};