import { ReactComponent as DiscordIcon } from "assets/icons/plaap/discord.svg";
import { ReactComponent as PlusIcon } from "assets/icons/plus-icon-16.svg";
import CardStepper from "../content/CardStepper";
import { ReactComponent as DefaultUserIcon } from "assets/icons/plaap/default-user-icon.svg";
import AirdropCard from "../AirdropCard";
import { RewardsApiInterface } from "utils/serverless-api/types";
import LinkWalletModal from "../LinkWalletModal";
import { useState } from "react";
import styled from "@emotion/styled";
import { shortenAddress } from "utils";

type CommunityRewardCardProps = {
  account: string | undefined;
  connectWalletHandler: () => void;
  isConnected: boolean;
  linkWalletHandler: () => Promise<void>;

  discordLoginHandler: () => void;
  discordLogoutHandler: () => void;
  isDiscordAuthenticated: boolean;

  rewardsData: RewardsApiInterface;

  discordAvatar?: string;
  discordId?: string;
  discordName?: string;
  walletIsLinked?: boolean;
};

const CommunityRewardCard = ({
  isConnected,
  discordLoginHandler,
  discordLogoutHandler,
  isDiscordAuthenticated,
  rewardsData,
  connectWalletHandler,
  linkWalletHandler,
  account,
  discordAvatar,
  discordName,
  walletIsLinked,
}: CommunityRewardCardProps) => {
  const [displayModal, setDisplayModal] = useState(false);
  console.log(walletIsLinked);
  const children = isConnected ? (
    <CardStepper
      steps={[
        {
          buttonContent: isDiscordAuthenticated
            ? "Disconnect"
            : "Connect Discord",
          buttonHandler: isDiscordAuthenticated
            ? discordLogoutHandler
            : discordLoginHandler,
          stepProgress:
            isConnected && isDiscordAuthenticated ? "completed" : "awaiting",
          stepTitle:
            isDiscordAuthenticated && discordName
              ? discordName
              : "Connect Discord",
          stepIcon: isDiscordAuthenticated ? (
            discordAvatar ? (
              <CustomAvatar src={discordAvatar} />
            ) : (
              <DefaultUserIcon />
            )
          ) : undefined,
          completedText: isDiscordAuthenticated
            ? "Eligible account"
            : undefined,
        },
        {
          buttonContent: walletIsLinked ? (
            "Change wallet"
          ) : (
            <>
              Link <PlusIcon />
            </>
          ),
          buttonHandler: () => setDisplayModal(true),
          stepProgress: walletIsLinked ? "completed" : "awaiting",
          stepTitle:
            walletIsLinked && account
              ? shortenAddress(account, "...", 4)
              : "Link to Ethereum wallet",
          completedText: walletIsLinked ? "Linked wallet" : undefined,
        },
      ]}
    />
  ) : null;

  let cardDescription =
    "Community members can check eligibility for the ACX airdrop by connecting their Discord account to an Ethereum wallet.";
  if (isDiscordAuthenticated && rewardsData?.communityRewards) {
    if (rewardsData.communityRewards.walletEligible) {
      if (walletIsLinked) {
        cardDescription =
          "Congratulations! You are now eligible for the Across Community Member airdrop.";
      }
    } else {
      cardDescription =
        "This Discord account isn’t eligible for the airdrop. If you have multiple accounts you could try connecting to a different one.";
    }
  }

  return (
    <>
      <AirdropCard
        title="Community Member"
        description={cardDescription}
        Icon={DiscordIcon}
        check={
          isConnected
            ? rewardsData?.communityRewards?.walletEligible
              ? "eligible"
              : "ineligible"
            : "undetermined"
        }
        children={children}
      />
      <LinkWalletModal
        linkWalletHandler={linkWalletHandler}
        isConnected={isConnected}
        connectWalletHandler={connectWalletHandler}
        displayModal={displayModal}
        exitModalHandler={() => setDisplayModal(false)}
        address={account}
      />
    </>
  );
};

export default CommunityRewardCard;

const CustomAvatar = styled.img`
  border-radius: 50%;
  height: 40px;
  width: 40px;

  padding: 1px;

  border: 1px solid black;
`;
