import { useContext, useEffect } from "react";
import { useState, createContext } from "react";
import { trackEvent } from "utils";
import { onboardInit } from "utils/onboardV2";
import { OnboardAPI } from "@web3-onboard/core";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import {
  ConnectOptions,
  WalletState,
  DisconnectOptions,
  ConnectedChain,
} from "@web3-onboard/core";
import { Chain } from "@web3-onboard/common";
import { ethers } from "ethers";
export type SetChainOptions = {
  chainId: string;
  chainNamespace?: string;
};

type OnboardContextValue = {
  onboard: OnboardAPI | null;
  connect: (options?: ConnectOptions | undefined) => Promise<WalletState[]>;
  disconnect: (wallet: DisconnectOptions) => Promise<WalletState[]>;
  chains: Chain[];
  connectedChain: ConnectedChain | null;
  settingChain: boolean;
  setChain: (options: SetChainOptions) => Promise<boolean>;
  wallet: WalletState | null;
  isConnected: boolean;
  signer: ethers.providers.JsonRpcSigner | undefined;
  provider: ethers.providers.Web3Provider | null;
};

function useOnboardManager() {
  const [onboard, setOnboard] = useState<OnboardAPI | null>(null);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<
    ethers.providers.JsonRpcSigner | undefined
  >(undefined);
  useEffect(() => {
    if (!onboard) setOnboard(onboardInit());
  }, [onboard]);

  const [{ wallet }, connect, disconnect] = useConnectWallet();
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();

  useEffect(() => {
    if (wallet?.provider) {
      setProvider(new ethers.providers.Web3Provider(wallet.provider, "any"));
      setSigner(new ethers.providers.Web3Provider(wallet.provider).getSigner());
    } else {
      setProvider(null);
      setSigner(undefined);
    }
  }, [wallet]);

  return {
    onboard,
    connect: (options?: ConnectOptions | undefined) => {
      trackEvent({ category: "wallet", action: "connect", name: "null" });
      return connect(options);
    },
    disconnect: (wallet: DisconnectOptions) => {
      trackEvent({ category: "wallet", action: "disconnect", name: "null" });
      return disconnect(wallet);
    },
    chains,
    connectedChain,
    settingChain,
    setChain,
    wallet,
    isConnected: !!connectedChain,
    signer,
    provider,
  };
}

const OnboardContext = createContext<OnboardContextValue | undefined>(
  undefined
);
OnboardContext.displayName = "OnboardContext";
export const OnboardProvider: React.FC = ({ children }) => {
  const value = useOnboardManager();
  return (
    <OnboardContext.Provider value={value}>{children}</OnboardContext.Provider>
  );
};

export function useOnboard() {
  const context = useContext(OnboardContext);
  if (!context) {
    throw new Error("useOnboard must be used within an <OnboardProvider>");
  }
  return context;
}
