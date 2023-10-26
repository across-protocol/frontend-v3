import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { DateTime } from "luxon";

import { ReactComponent as CheckIcon } from "assets/check.svg";
import { ReactComponent as LoadingIcon } from "assets/loading.svg";
import { ReactComponent as ExternalLinkIcon } from "assets/icons/external-link-16.svg";

import { Text, CardWrapper } from "components";
import { getChainInfo, COLORS } from "utils";
import { useAmplitude } from "hooks";
import { ampli } from "ampli";

import { ElapsedTime } from "./ElapsedTime";
import { DepositStatus } from "../types";

type Props = {
  status: DepositStatus;
  depositTxCompletedTimestampSeconds?: number;
  depositTxElapsedSeconds?: number;
  fillTxElapsedSeconds?: number;
  fillTxHash?: string;
  depositTxHash?: string;
  fromChainId: number;
  toChainId: number;
};

export function DepositTimesCard({
  status,
  depositTxCompletedTimestampSeconds,
  depositTxElapsedSeconds,
  fillTxElapsedSeconds,
  fillTxHash,
  depositTxHash,
  fromChainId,
  toChainId,
}: Props) {
  const isDepositing = status === "depositing";
  const isFilled = status === "filled";

  const { addToAmpliQueue } = useAmplitude();

  return (
    <CardWrapper>
      <Row>
        <Text>Deposit time</Text>
        {isDepositing ? (
          <ElapsedTime
            elapsedSeconds={depositTxElapsedSeconds}
            isCompleted={false}
            StatusIcon={<StyledLoadingIcon />}
          />
        ) : depositTxElapsedSeconds !== undefined ? (
          <ElapsedTime
            elapsedSeconds={depositTxElapsedSeconds}
            isCompleted
            StatusIcon={
              <CheckIconExplorerLink
                txHash={depositTxHash}
                chainId={fromChainId}
              />
            }
          />
        ) : (
          <DateWrapper>
            <Text color="aqua">
              {depositTxCompletedTimestampSeconds
                ? DateTime.fromSeconds(
                    depositTxCompletedTimestampSeconds
                  ).toFormat("d MMM yyyy - t")
                : "-"}
            </Text>
            <CheckIconExplorerLink
              txHash={depositTxHash}
              chainId={fromChainId}
            />
          </DateWrapper>
        )}
      </Row>
      <Row>
        <Text>Fill time</Text>
        {isDepositing ? (
          <Text>-</Text>
        ) : (
          <ElapsedTime
            elapsedSeconds={fillTxElapsedSeconds}
            isCompleted={isFilled}
            StatusIcon={
              isFilled ? (
                <CheckIconExplorerLink
                  txHash={fillTxHash}
                  chainId={toChainId}
                />
              ) : (
                <StyledLoadingIcon />
              )
            }
          />
        )}
      </Row>
      <Divider />
      <Row>
        <Text>Total time</Text>
        {!isFilled ? (
          <Text>-</Text>
        ) : (
          <ElapsedTime
            elapsedSeconds={
              (depositTxElapsedSeconds || 0) + (fillTxElapsedSeconds || 0)
            }
            isCompleted
            StatusIcon={<CheckIcon />}
          />
        )}
      </Row>
      <TransactionsPageLinkWrapper
        href="/transactions"
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          addToAmpliQueue(() => {
            ampli.monitorDepositProgressClicked({
              action: "onClick",
              element: "monitorDepositProgressLink",
              page: "bridgePage",
              section: "depositConfirmation",
            });
          });
        }}
      >
        <Text>
          View on{" "}
          <Text color="white" as="span">
            Transactions page
          </Text>
        </Text>
        <ExternalLinkIcon />
      </TransactionsPageLinkWrapper>
    </CardWrapper>
  );
}

function CheckIconExplorerLink({
  txHash,
  chainId,
}: {
  txHash?: string;
  chainId: number;
}) {
  const chainInfo = getChainInfo(chainId);

  if (!txHash) {
    return <CheckIcon />;
  }

  return (
    <a
      href={chainInfo.constructExplorerLink(txHash)}
      target="_blank"
      rel="noreferrer"
    >
      <CheckIcon />
    </a>
  );
}

const Row = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: ${COLORS["grey-600"]};
`;

const DateWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const TransactionsPageLinkWrapper = styled.a`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  border: 1px solid ${COLORS["grey-500"]};
  border-radius: 0.5rem;
  padding: 1rem;
  text-decoration: none;
`;

const RotationKeyframes = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const StyledLoadingIcon = styled(LoadingIcon)`
  animation: ${RotationKeyframes} 2.5s linear infinite;
`;
