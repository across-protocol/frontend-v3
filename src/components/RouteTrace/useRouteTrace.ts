import useReferrer from "hooks/useReferrer";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { currentGitCommitHash, getConfig } from "utils";
import { ampli } from "../../ampli";

export function useRouteTrace() {
  const location = useLocation();
  const { referrer: referralAddress, isResolved: isReferralAddressResolved } =
    useReferrer();
  const [initialPage, setInitialPage] = useState(true);
  const [path, setPath] = useState("");

  useEffect(() => {
    if (location.pathname !== "" && path !== location.pathname) {
      setPath(location.pathname);
    }
  }, [location, path]);

  useEffect(() => {
    if (path && isReferralAddressResolved) {
      const referrer = document.referrer;
      const origin = window.location.origin;
      const page = pageLookup[path] ?? "404Page";
      ampli.pageViewed({
        path,
        referrer,
        origin,
        isInitialPageView: initialPage,
        page,
        gitCommitHash: currentGitCommitHash,
        referralProgramAddress: referralAddress,
      });

      if (initialPage) {
        setInitialPage(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, isReferralAddressResolved]);
}

export const pageLookup: Record<
  string,
  | "404Page"
  | "splashPage"
  | "bridgePage"
  | "poolPage"
  | "rewardsPage"
  | "transactionsPage"
  | "stakingPage"
  | "referralPage"
  | "airdropPage"
> = {
  "/": "splashPage",
  "/bridge": "bridgePage",
  "/pool": "poolPage",
  "/rewards": "rewardsPage",
  "/rewards/referrals": "referralPage",
  "/airdrop": "airdropPage",
  "/transactions": "transactionsPage",
  ...getConfig()
    .getPoolSymbols()
    .reduce(
      (acc, sym) => ({
        ...acc,
        [`/rewards/staking/${sym.toLowerCase()}`]: "stakingPage",
      }),
      {}
    ),
};