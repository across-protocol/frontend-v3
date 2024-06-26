import { useConnection, useRewardSummary } from "hooks";
import { GenericRewardInformationRowType } from "../GenericRewardsProgram/GenericInformationCard";
import {
  capitalizeFirstLetter,
  formatUnitsWithMaxFractions,
  getToken,
  rewardPrograms,
} from "utils";
import { useMemo } from "react";
import { BigNumber } from "ethers";
import { useUnclaimedOpRewardsProofs } from "hooks/useUnclaimedProofs";

export function useOPRebatesProgram() {
  const { account } = useConnection();
  const { summary } = useRewardSummary("op-rebates", account);
  const { programName, claimableTooltipBody } = rewardPrograms["op-rebates"];
  const token = useMemo(() => getToken("OP"), []);
  const { data: unclaimedOpRewardsData } = useUnclaimedOpRewardsProofs();

  if (summary.program !== "op-rebates") {
    throw new Error("Invalid program type");
  }

  const labels: GenericRewardInformationRowType[] = useMemo(
    () => [
      {
        title: "Volume to Optimism",
        tooltip: "Volume sent to Optimism",
        prefix: `${summary.depositsCount} transfer${
          summary.depositsCount === 1 ? "" : "s"
        }`,
        value: `$${summary.volumeUsd}`,
      },
      {
        title: "Rewards",
        tooltip: "Rewards earned from this Optimism program",
        value: `${formatUnitsWithMaxFractions(
          summary.unclaimedRewards || 0,
          token.decimals
        )} ${token.symbol}`,
        prefix: `${formatUnitsWithMaxFractions(
          unclaimedOpRewardsData?.claimableAmount ?? 0,
          token.decimals
        )} ${token.symbol} claimable`,
        prefixIcon: "info",
        prefixIconTooltip: {
          content: claimableTooltipBody,
          title: `${capitalizeFirstLetter(programName.toLowerCase())} claiming`,
        },
      },
    ],
    [
      programName,
      summary,
      token,
      unclaimedOpRewardsData?.claimableAmount,
      claimableTooltipBody,
    ]
  );

  return {
    labels,
    rewardsAmount: BigNumber.from(summary.unclaimedRewards || 0),
    claimableAmount: BigNumber.from(
      unclaimedOpRewardsData?.claimableAmount || 0
    ),
  };
}
