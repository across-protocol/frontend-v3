import styled from "@emotion/styled";
import {
  COLORS,
  QUERIESV2,
  getToken,
  rewardProgramTypes,
  rewardPrograms,
} from "utils";
import { PrimaryButton, Text } from "components";
import copy from "copy-to-clipboard";
import { useReferralLink } from "hooks/useReferralLink";
import { useCallback, useEffect, useState } from "react";
import { useConnection } from "hooks";
import { useHistory } from "react-router-dom";

type ReferralCTAProps = {
  program: rewardProgramTypes;
};

const ReferralCTA = ({ program }: ReferralCTAProps) => {
  const { push: navigate } = useHistory();
  const { referralLinkWithProtocol } = useReferralLink();
  const { isConnected, connect } = useConnection();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const t = setTimeout(() => {
        setIsCopied(false);
      }, 1000);
      return () => clearTimeout(t);
    }
  });

  const rewardProgram = rewardPrograms[program];
  const rewardToken = getToken(rewardProgram.rewardTokenSymbol);

  const handleClick = useCallback(() => {
    if (rewardProgram.rewardTokenSymbol === "ACX") {
      if (!isConnected) {
        connect({
          trackSection: "bridgeForm",
        });
        setIsCopied(false);
      } else if (referralLinkWithProtocol) {
        copy(referralLinkWithProtocol);
        setIsCopied(true);
      }
    } else {
      navigate(rewardProgram.url);
    }
  }, [connect, isConnected, navigate, referralLinkWithProtocol, rewardProgram]);

  const bodyCopy =
    rewardProgram.rewardTokenSymbol === "ACX"
      ? "Share your unique referral link and earn on every transaction made with your link."
      : "Bridge to Optimism and earn on every transaction.";

  const buttonCopy =
    rewardProgram.rewardTokenSymbol === "ACX"
      ? isConnected
        ? "Copy link"
        : "Connect"
      : "View Rewards";

  return (
    <Wrapper
      primaryColor={rewardProgram.primaryColor}
      bgUrl={rewardProgram.backgroundUrl}
    >
      <LogoContainer primaryColor={rewardProgram.primaryColor}>
        <StyledLogo src={rewardToken.logoURI} />
      </LogoContainer>
      <TextStack>
        <Text color="white" size="md">
          Earn up to{" "}
          <HighlightText program={program}>
            {rewardProgram.highestPct * 100}%
          </HighlightText>{" "}
          in {rewardProgram.rewardTokenSymbol} Rewards
        </Text>
        <Text color="grey-400" size="sm">
          {bodyCopy}
        </Text>
      </TextStack>
      <StyledCopyButton
        onClick={handleClick}
        size="md"
        backgroundColor="black-700"
        textColor={program === "referrals" ? "aqua" : "white"}
        isCopied={isCopied}
        disabled={isCopied}
        primaryColor={rewardProgram.primaryColor}
      >
        {buttonCopy}
      </StyledCopyButton>
      <TextButton
        size="md"
        weight={500}
        onClick={handleClick}
        primaryColor={rewardProgram.primaryColor}
      >
        {buttonCopy}
      </TextButton>
    </Wrapper>
  );
};

export default ReferralCTA;

const Wrapper = styled.div<{ bgUrl: string; primaryColor: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1 0 0;
  align-self: stretch;

  padding: 24px 16px;

  border-radius: 8px;
  border: 1px solid
    ${({ primaryColor }) => COLORS[`${primaryColor}-15` as keyof typeof COLORS]};
  background: url(${({ bgUrl }) => bgUrl}) no-repeat;
  background-size: cover;

  @media ${QUERIESV2.sm.andDown} {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    align-self: stretch;

    padding: 16px;
  }
`;

const LogoContainer = styled.div<{ primaryColor: string }>`
  // Layout
  display: flex;
  padding: 8px;
  align-items: flex-start;

  // Colors
  border-radius: 32px;
  border: 1px solid
    ${({ primaryColor }) => COLORS[`${primaryColor}-15` as keyof typeof COLORS]};
  background: ${COLORS["grey-400-5"]};

  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.08),
    0px 2px 6px 0px rgba(0, 0, 0, 0.08);

  @media ${QUERIESV2.sm.andDown} {
    display: none;
  }
`;

const StyledLogo = styled.img`
  height: 24px;
  width: auto;
`;

const TextStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  flex: 1 0 0;
`;

const StyledCopyButton = styled(PrimaryButton)<{
  isCopied?: boolean;
  primaryColor: string;
  textColor: keyof typeof COLORS;
}>`
  border: 1px solid
    ${({ primaryColor }) => COLORS[`${primaryColor}-15` as keyof typeof COLORS]};

  @media ${QUERIESV2.sm.andDown} {
    display: none;
  }
  transition: all 0.2s ease-in-out;

  background-color: ${({ isCopied }) =>
    isCopied ? COLORS["aqua"] : COLORS["black-700"]};
  color: ${({ isCopied, textColor }) =>
    isCopied ? COLORS["black-700"] : COLORS[textColor]};
`;

const HighlightText = styled.span<{ program: rewardProgramTypes }>`
  color: ${({ program }) => COLORS[rewardPrograms[program].primaryColor]};
`;

const TextButton = styled(Text)<{ primaryColor: keyof typeof COLORS }>`
  cursor: pointer;
  color: ${({ primaryColor }) => COLORS[primaryColor]};
  display: none;
  @media ${QUERIESV2.sm.andDown} {
    display: block;
  }
`;
