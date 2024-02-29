import { utils } from "@across-protocol/sdk-v2";
import { LogDescription } from "ethers/lib/utils";
import { SpokePool__factory } from "./typechain";

export class NoFundsDepositedLogError extends Error {
  constructor(depositTxHash: string, chainId: number) {
    super(
      `Could not parse log FundsDeposited in tx ${depositTxHash} on chain ${chainId}`
    );
  }
}

export function parseFundsDepositedLog(
  logs: Array<{
    topics: string[];
    data: string;
  }>
): LogDescription | undefined {
  const spokePoolIface = SpokePool__factory.createInterface();
  const parsedLogs = logs.flatMap((log) => {
    try {
      return spokePoolIface.parseLog(log);
    } catch (e) {
      return [];
    }
  });
  // Return either the V2 or V3 log if either is present
  return parsedLogs.find(
    (log) => log.name === "FundsDeposited" || log.name === "V3FundsDeposited"
  );
}

export async function getDepositByTxHash(
  depositTxHash: string,
  fromChainId: number
) {
  return {
    depositTxReceipt: {},
    parsedDepositLog: {},
    depositTimestamp: utils.getCurrentTime(),
    isV2: false,
  };
}

export async function getFillByDepositTxHash(
  depositTxHash: string,
  fromChainId: number,
  toChainId: number,
  depositByTxHash: Awaited<ReturnType<typeof getDepositByTxHash>>
) {
  if (!depositByTxHash) {
    throw new Error(
      `Could not fetch deposit by tx hash ${depositTxHash} on chain ${fromChainId}`
    );
  }

  return {
    fillTxHashes: [],
    fillTxTimestamp: utils.getCurrentTime(),
    depositByTxHash,
  };
}
