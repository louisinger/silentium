
import { HDKey } from '@scure/bip32';

export function deriveBIP352Keys(
    master: HDKey,
    isMainnet: boolean,
): { scan: HDKey, spend: HDKey } {
    const account = master.derive(`m/352'/${isMainnet ? 0 : 1}'/0'`)

    const scan = account.derive(`m/1'/0`)
    const spend = account.derive(`m/0'/0`)

    return { scan, spend };
}
