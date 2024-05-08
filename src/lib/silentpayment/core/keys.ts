import { BIP32Interface } from 'bip32';

const BIP352_PURPOSE = 352;

export function deriveBIP352Keys(
    master: BIP32Interface,
    isMainnet: boolean,
): { scan: BIP32Interface, spend: BIP32Interface } {
    const account = master
        .deriveHardened(BIP352_PURPOSE)
        .deriveHardened(isMainnet ? 0 : 1)
        .deriveHardened(0)

    const scan = account.deriveHardened(1).derive(0);
    const spend = account.deriveHardened(0).derive(0);

    return { scan, spend };
}
