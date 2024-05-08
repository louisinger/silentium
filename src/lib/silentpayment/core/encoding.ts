import { bech32m } from '@scure/base';
import { Network } from 'bitcoinjs-lib';

export function encodeSilentPaymentAddress(
    scanPubKey: Uint8Array,
    spendPubKey: Uint8Array,
    network: Network,
    version: number = 0,
): string {
    const data = bech32m.toWords(Buffer.concat([scanPubKey, spendPubKey]));
    data.unshift(version);

    return bech32m.encode(hrpFromNetwork(network), data, 1023);
};

export function decodeSilentPaymentAddress(
    address: string,
    network: Network,
): { scanKey: Buffer; spendKey: Buffer } {
    const { prefix, words } = bech32m.decode(address, 1023);
    if (prefix != hrpFromNetwork(network)) throw new Error('Invalid prefix!');

    const version = words.shift();
    if (version != 0) throw new Error('Invalid version!');

    const key = Buffer.from(bech32m.fromWords(words));

    return {
        scanKey: key.slice(0, 33),
        spendKey: key.slice(33),
    };
};

export function isSilentPaymentAddress(address: string, network: Network): boolean {
    try {
        decodeSilentPaymentAddress(address, network);
        return true;
    } catch (e) {
        return false;
    }
}

const hrpFromNetwork = (network: Network): string => {
    return network.bech32 === 'bc' ? 'sp' : 'tsp';
};
