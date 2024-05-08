import { Network } from 'bitcoinjs-lib';
import * as secp from 'secp256k1';
import { Outpoint, Output, PrivateKey, RecipientAddress } from './types';
import { calculateSumOfPrivateKeys, createInputHash, createTaggedHash, getPublicKey, serialiseUint32 } from './utils';
import { decodeSilentPaymentAddress } from './encoding';

export function createOutputs(
    inputPrivateKeys: PrivateKey[],
    smallestOutpoint: Outpoint,
    recipientAddresses: RecipientAddress[],
    network: Network,
): Output[] {
    const sumOfPrivateKeys = calculateSumOfPrivateKeys(inputPrivateKeys);
    const inputHash = createInputHash(
        getPublicKey(sumOfPrivateKeys),
        smallestOutpoint,
    );

    const paymentGroups = new Map<
        string,
        { spendKey: Buffer; amount: number }[]
    >();

    for (const { address, amount } of recipientAddresses) {
        const { scanKey, spendKey } = decodeSilentPaymentAddress(
            address,
            network,
        );
        if (paymentGroups.has(scanKey.toString('hex'))) {
            paymentGroups
                .get(scanKey.toString('hex'))
                ?.push({ spendKey, amount });
        } else {
            paymentGroups.set(scanKey.toString('hex'), [{ spendKey, amount }]);
        }
    }

    const outputs: Output[] = [];
    for (const [scanKeyHex, paymentGroup] of paymentGroups.entries()) {
        const scanKey = Buffer.from(scanKeyHex, 'hex');
        const point = secp.publicKeyTweakMul(
            Buffer.from(scanKey), 
            Buffer.from(inputHash), 
            true
        );
        const ecdhSecret = secp.publicKeyTweakMul(
            Buffer.from(point),
            Buffer.from(sumOfPrivateKeys),
            true,
        );

        let n = 0;
        for (const { spendKey, amount } of paymentGroup) {
            const tweak = createTaggedHash(
                'BIP0352/SharedSecret',
                Buffer.concat([Buffer.from(ecdhSecret), serialiseUint32(n)]),
            );

            const publicKey = secp.publicKeyTweakAdd(
                Buffer.from(spendKey),
                Buffer.from(tweak),
                true,
            );

            const script = Buffer.concat([
                Buffer.from([0x51, 0x20]),
                publicKey.slice(1),
            ]);

            outputs.push({
                script,
                value: amount,
            });
            n++;
        }
    }

    return outputs;
};

