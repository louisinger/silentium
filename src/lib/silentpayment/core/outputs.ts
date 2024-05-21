import * as secp from '@bitcoinerlab/secp256k1';
import { Outpoint, Output, PrivateKey, RecipientAddress } from './types';
import { calculateSumOfPrivateKeys, createInputHash, serialiseUint32 } from './utils';
import { decodeSilentPaymentAddress } from './encoding';
import { schnorr, secp256k1 } from '@noble/curves/secp256k1';
import { Network } from '../../network';

export function createOutputs(
    inputPrivateKeys: PrivateKey[],
    smallestOutpoint: Outpoint,
    recipientAddresses: RecipientAddress[],
    network: Network,
): [Output[], string[]] {
    const sumOfPrivateKeys = calculateSumOfPrivateKeys(inputPrivateKeys);
    const inputHash = createInputHash(
        Buffer.from(secp256k1.getPublicKey(sumOfPrivateKeys, true)),
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
    const tweaks: string[] = [];
    for (const [scanKeyHex, paymentGroup] of paymentGroups.entries()) {
        const scanKey = Buffer.from(scanKeyHex, 'hex');
        const point = secp.pointMultiply(
            Buffer.from(scanKey), 
            Buffer.from(inputHash), 
            true
        );

        if (!point) {
            throw new Error('Could not derive point');
        }

        const ecdhSecret = secp.pointMultiply(
            Buffer.from(point),
            Buffer.from(sumOfPrivateKeys),
            true,
        );

        if (!ecdhSecret) {
            throw new Error('Could not derive ecdhSecret');
        }

        let n = 0;
        for (const { spendKey, amount } of paymentGroup) {
            const tweak = schnorr.utils.taggedHash(
                'BIP0352/SharedSecret',
                Buffer.concat([Buffer.from(ecdhSecret), serialiseUint32(n)]),
            );

            const publicKey = secp.pointAddScalar(
                Buffer.from(spendKey),
                Buffer.from(tweak),
                true,
            );

            if (!publicKey) {
                throw new Error('Could not derive public key');
            }

            const script = Buffer.concat([
                Buffer.from([0x51, 0x20]),
                publicKey.slice(1),
            ]);

            outputs.push({
                script,
                value: amount,
            });
            tweaks.push(Buffer.from(tweak).toString('hex'));
            n++;
        }
    }

    return [outputs, tweaks];
};

