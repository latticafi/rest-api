import type { PrivateKeyAccount } from "viem/accounts";

import { privateKeyToAccount } from "viem/accounts";

let _account: PrivateKeyAccount | null = null;

function getAccount(): PrivateKeyAccount {
  if (!_account) {
    if (!process.env.ORACLE_SIGNER_PRIVATE_KEY) {
      throw new Error("ORACLE_SIGNER_PRIVATE_KEY environment variable not set");
    }
    _account = privateKeyToAccount(
      process.env.ORACLE_SIGNER_PRIVATE_KEY as `0x${string}`,
    );
  }
  return _account;
}

export function getOracleSignerAddress(): string {
  return getAccount().address;
}

export async function signPriceAttestation(params: {
  poolAddress: `0x${string}`;
  conditionId: `0x${string}`;
  price: bigint;
  timestamp: bigint;
  deadline: bigint;
  chainId: number;
}): Promise<`0x${string}`> {
  const account = getAccount();

  return account.signTypedData({
    domain: {
      name: "LatticaPriceFeed",
      version: "1",
      chainId: params.chainId,
      verifyingContract: params.poolAddress,
    },
    types: {
      PriceAttestation: [
        { name: "conditionId", type: "bytes32" },
        { name: "price", type: "uint256" },
        { name: "timestamp", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "PriceAttestation",
    message: {
      conditionId: params.conditionId,
      price: params.price,
      timestamp: params.timestamp,
      deadline: params.deadline,
    },
  });
}
