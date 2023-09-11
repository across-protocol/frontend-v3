import styled from "@emotion/styled";
import { BigNumber } from "ethers";

import { Text } from "components/Text";
import { Tooltip } from "components/Tooltip";
import { ReactComponent as InfoIcon } from "assets/icons/info-16.svg";

import {
  bridgedUSDCSymbolsMap,
  capitalizeFirstLetter,
  ChainId,
  getChainInfo,
  TokenInfo,
} from "utils";

import TokenFee from "./TokenFee";

type EstimatedTableProps = {
  chainId: number;
  estimatedTime?: string;
  gasFee?: BigNumber;
  bridgeFee?: BigNumber;
  totalReceived?: BigNumber;
  token: TokenInfo;
  dataLoaded: boolean;
  receiveToken: TokenInfo;
};

const EstimatedTable = ({
  chainId,
  estimatedTime,
  gasFee,
  bridgeFee,
  token,
  totalReceived,
  receiveToken,
}: EstimatedTableProps) => (
  <Wrapper>
    <Row>
      <Text size="md" color="grey-400">
        Time to{" "}
        <WhiteText>
          {capitalizeFirstLetter(getChainInfo(chainId).name)}
        </WhiteText>
      </Text>
      <Text size="md" color="grey-400">
        {estimatedTime ? estimatedTime : "-"}
      </Text>
    </Row>
    <Row>
      <Text size="md" color="grey-400">
        Destination gas fee
      </Text>
      <Text size="md" color="grey-400">
        {gasFee ? <TokenFee amount={gasFee} token={token} /> : "-"}
      </Text>
    </Row>
    <Row>
      <Text size="md" color="grey-400">
        Bridge fee
      </Text>
      <Text size="md" color="grey-400">
        {bridgeFee ? <TokenFee amount={bridgeFee} token={token} /> : "-"}
      </Text>
    </Row>
    <Row>
      <Text size="md" color="grey-400">
        You will receive
      </Text>
      <Text size="md" color="grey-400">
        {totalReceived ? (
          <TotalReceive
            totalReceived={totalReceived}
            token={token}
            receiveToken={receiveToken}
            destinationChainId={chainId}
          />
        ) : (
          "-"
        )}
      </Text>
    </Row>
  </Wrapper>
);

function TotalReceive({
  totalReceived,
  token,
  receiveToken,
  destinationChainId,
}: {
  totalReceived: BigNumber;
  receiveToken: TokenInfo;
  token: TokenInfo;
  destinationChainId: number;
}) {
  const areTokensSame = token.symbol === receiveToken.symbol;

  if (areTokensSame) {
    return <TokenFee amount={totalReceived} token={token} />;
  }
  const destinationChainName = capitalizeFirstLetter(
    getChainInfo(destinationChainId).name
  );
  const tooltipText =
    token.symbol === "ETH"
      ? "When bridging ETH and recipient address is a smart contract, or destination is Polygon, you will receive WETH."
      : token.symbol === "WETH"
      ? "When bridging WETH and recipient address is an EOA, you will receive ETH."
      : token.symbol === "USDC"
      ? `When bridging USDC to ${destinationChainName}, you will receive ${bridgedUSDCSymbolsMap[destinationChainId]} (bridged USDC).`
      : token.symbol === "USDC.e"
      ? `When bridging USDC.e from Arbitrum, you will receive ${
          destinationChainId === ChainId.BASE ? "USDbC" : "USDC"
        }.`
      : token.symbol === "USDbC"
      ? `When bridging USDbC from Base, you will receive ${
          destinationChainId === ChainId.ARBITRUM ? "USDC.e" : "USDC"
        }.`
      : "";

  return (
    <TotalReceiveRow>
      <Tooltip
        tooltipId="eth-weth-info"
        body={tooltipText}
        placement="bottom-start"
      >
        <WarningInfoIcon />
      </Tooltip>
      <TokenFee
        amount={totalReceived}
        token={receiveToken}
        textColor="warning"
      />
    </TotalReceiveRow>
  );
}

export default EstimatedTable;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 16px;

  width: 100%;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  gap: 6px;

  width: 100%;
`;

const WhiteText = styled.span`
  color: #e0f3ff;
`;

const TotalReceiveRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const WarningInfoIcon = styled(InfoIcon)`
  margin-top: 8px;
  path {
    stroke: #f9d26c;
  }
`;
