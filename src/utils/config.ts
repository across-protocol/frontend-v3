import assert from "assert";
import { Signer } from "./ethers";
import * as constants from "./constants";
import * as providerUtils from "./providers";
import filter from "lodash/filter";
import sortBy from "lodash/sortBy";

import {
  HubPool,
  HubPool__factory,
  SpokePool,
  SpokePool__factory,
  SpokePoolVerifier,
  SpokePoolVerifier__factory,
  AcrossMerkleDistributor,
  AcrossMerkleDistributor__factory,
  AcceleratingDistributor,
  AcceleratingDistributor__factory,
  ClaimAndStake,
  ClaimAndStake__factory,
  UniversalSwapAndBridge,
  UniversalSwapAndBridge__factory,
} from "utils/typechain";
import { SupportedDex } from "./serverless-api/prod/swap-quote";

export type Token = constants.TokenInfo & {
  l1TokenAddress: string;
  address: string;
  isNative: boolean;
};
export type TokenList = Token[];

export interface DepositDelays {
  [chainId: string]: number;
}

export class ConfigClient {
  public readonly spokeAddresses: Record<number, string> = {};
  public readonly spokeChains: Set<number> = new Set();
  public readonly fromChains: Set<number> = new Set();
  public readonly toChains: Set<number> = new Set();
  public readonly enabledChainsSpokePoolVerifier: Set<number> = new Set();
  public readonly spokePoolVerifierAddress: string = "";
  public readonly swapAndBridgeAddresses: {
    [dexKey: string]: {
      [chainId: string]: string;
    };
  } = {};
  public tokenOrder: Record<string, number> = {};
  public chainOrder: Record<string, number> = {};
  public routes: constants.Routes = [];
  public swapRoutes: constants.SwapRoutes = [];
  public pools: constants.Pools = [];
  constructor(
    private config: constants.RouteConfig,
    private disabledTokens: string[] = []
  ) {
    this.config.routes.forEach((route) => {
      this.spokeAddresses[route.fromChain] = route.fromSpokeAddress;
      this.spokeChains.add(route.fromChain);
      this.spokeChains.add(route.toChain);
      this.toChains.add(route.toChain);
      this.fromChains.add(route.fromChain);
    });
    // this lets us sort arbitrary array of tokens
    this.tokenOrder = Object.fromEntries(
      Object.entries(constants.tokenList).map(([index, token]) => [
        token.symbol,
        Number(index),
      ])
    );
    // this lets us sort arbitrary list of chains
    constants.chainInfoList.forEach((chain, index) => {
      const { chainId } = chain;
      assert(
        constants.isSupportedChainId(chainId),
        "Unsupported chainId: " + chainId
      );
      this.chainOrder[chainId] = Number(index);
    });
    // prioritize routes based on token symbol and tochain. This just gives us better route prioritization when filtering a fromChain
    this.routes = sortBy(this.config.routes, (route) => {
      return (
        this.tokenOrder[route.fromTokenSymbol] + this.chainOrder[route.toChain]
      );
    });
    this.swapRoutes = this.config.swapRoutes;
    this.pools = this.config.pools;
    this.enabledChainsSpokePoolVerifier = new Set(
      this.config.spokePoolVerifier.enabledChains || []
    );
    this.spokePoolVerifierAddress = this.config.spokePoolVerifier.address;
    this.swapAndBridgeAddresses = this.config.swapAndBridgeAddresses || {};
  }
  getWethAddress(): string {
    return this.config.hubPoolWethAddress;
  }
  getEnabledRoutes(): constants.Routes {
    return this.routes.filter(
      (route) =>
        !this.disabledTokens.includes(route.fromTokenSymbol) &&
        ![route.fromChain, route.toChain].some((chainId) =>
          [
            ...constants.disabledChainIds,
            ...constants.disabledChainIdsForAvailableRoutes,
          ].includes(chainId.toString())
        ) &&
        !constants.disabledTokensForAvailableRoutes.some(
          (s) => s.toUpperCase() === route.fromTokenSymbol.toUpperCase()
        )
    );
  }
  getSwapRoutes(): constants.SwapRoutes {
    return this.swapRoutes;
  }
  getRoutes(): constants.Routes {
    return this.routes;
  }
  getPools(): constants.Pools {
    return this.pools;
  }
  getSpokePoolAddress(chainId: constants.ChainId): string {
    const address = this.spokeAddresses[chainId];
    assert(address, "Spoke pool not supported on chain: " + chainId);
    return address;
  }
  getSpokePool(chainId: constants.ChainId, signer?: Signer): SpokePool {
    const address = this.getSpokePoolAddress(chainId);
    const provider = signer ?? providerUtils.getProvider(chainId);
    return SpokePool__factory.connect(address, provider);
  }
  getSpokePoolVerifierAddress(chainId: constants.ChainId): string | undefined {
    if (!this.enabledChainsSpokePoolVerifier.has(chainId)) {
      return undefined;
    }
    return this.spokePoolVerifierAddress;
  }
  getSpokePoolVerifier(
    chainId: constants.ChainId,
    signer?: Signer
  ): SpokePoolVerifier | undefined {
    const address = this.getSpokePoolVerifierAddress(chainId);

    if (!address) {
      return undefined;
    }

    const provider = signer ?? providerUtils.getProvider(chainId);
    return SpokePoolVerifier__factory.connect(address, provider);
  }
  getSwapAndBridgeAddress(
    chainId: constants.ChainId,
    dexKey: SupportedDex
  ): string | undefined {
    return this.swapAndBridgeAddresses[dexKey]?.[chainId];
  }
  getSwapAndBridge(
    chainId: constants.ChainId,
    dexKey: SupportedDex,
    signer?: Signer
  ): UniversalSwapAndBridge | undefined {
    const address = this.getSwapAndBridgeAddress(chainId, dexKey);

    if (!address) {
      return undefined;
    }

    const provider = signer ?? providerUtils.getProvider(chainId);
    return UniversalSwapAndBridge__factory.connect(address, provider);
  }
  getHubPoolChainId(): constants.ChainId {
    return this.config.hubPoolChain;
  }
  getHubPoolAddress(): string {
    return this.config.hubPoolAddress;
  }
  getAcceleratingDistributorAddress(): string {
    return (
      process.env.REACT_APP_ACCELERATING_DISTRIBUTOR_ADDRESS ||
      this.config.acceleratingDistributorAddress ||
      "0x9040e41eF5E8b281535a96D9a48aCb8cfaBD9a48"
    );
  }
  getMerkleDistributorAddress(): string {
    return (
      process.env.REACT_APP_MERKLE_DISTRIBUTOR_ADDRESS ||
      this.config.merkleDistributorAddress ||
      "0xE50b2cEAC4f60E840Ae513924033E753e2366487"
    );
  }
  getOpRewardsMerkleDistributorAddress(): string {
    return (
      process.env.REACT_APP_OP_REWARDS_MERKLE_DISTRIBUTOR_ADDRESS ||
      "0xc8b31410340d57417bE62672f6B53dfB9de30aC2"
    );
  }
  getOpRewardsMerkleDistributorChainId(): number {
    return parseInt(
      process.env.REACT_APP_OP_REWARDS_MERKLE_DISTRIBUTOR_CHAIN_ID || "10"
    );
  }
  getAcrossTokenAddress(): string {
    return (
      process.env.REACT_APP_ACROSS_TOKEN_ADDRESS ||
      this.config.acrossTokenAddress ||
      "0x44108f0223A3C3028F5Fe7AEC7f9bb2E66beF82F"
    );
  }
  getOpTokenAddress(): string {
    return "0x4200000000000000000000000000000000000042";
  }
  getClaimAndStakeAddress(): string {
    return (
      process.env.REACT_APP_CLAIM_AND_STAKE_ADDRESS ||
      this.config.claimAndStakeAddress ||
      "0x985e8A89Dd6Af8896Ef075c8dd93512433dc5829"
    );
  }
  getL1TokenAddressBySymbol(symbol: string) {
    // all routes have an l1Token address, so just find the first symbol that matches
    const route = this.getRoutes().find((x) => x.fromTokenSymbol === symbol);
    assert(route, `Unsupported l1 address lookup by symbol: ${symbol}`);
    return route.l1TokenAddress;
  }
  getHubPool(signer?: Signer): HubPool {
    const address = this.getHubPoolAddress();
    const provider =
      signer ?? providerUtils.getProvider(this.getHubPoolChainId());
    return HubPool__factory.connect(address, provider);
  }
  getAcceleratingDistributor(signer?: Signer): AcceleratingDistributor {
    const address = this.getAcceleratingDistributorAddress();
    const provider =
      signer ?? providerUtils.getProvider(this.getHubPoolChainId());
    return AcceleratingDistributor__factory.connect(address, provider);
  }
  getMerkleDistributor(
    rewardsType: constants.rewardProgramTypes,
    signer?: Signer
  ): AcrossMerkleDistributor {
    let address =
      rewardsType === "referrals"
        ? this.getMerkleDistributorAddress()
        : this.getOpRewardsMerkleDistributorAddress();

    let provider =
      signer ??
      providerUtils.getProvider(
        rewardsType === "referrals"
          ? this.getHubPoolChainId()
          : this.getOpRewardsMerkleDistributorChainId()
      );

    return AcrossMerkleDistributor__factory.connect(address, provider);
  }
  getClaimAndStake(signer?: Signer): ClaimAndStake {
    const address = this.getClaimAndStakeAddress();
    const provider =
      signer ?? providerUtils.getProvider(this.getHubPoolChainId());
    return ClaimAndStake__factory.connect(address, provider);
  }
  filterRoutes(query: Partial<constants.Route>): constants.Routes {
    const cleanQuery: Partial<constants.Route> = Object.fromEntries(
      Object.entries(query).filter((entry) => {
        return entry[1] !== undefined;
      })
    );
    return filter(this.getRoutes(), cleanQuery);
  }
  filterSwapRoutes(query: Partial<constants.SwapRoute>): constants.SwapRoutes {
    const cleanQuery: Partial<constants.SwapRoute> = Object.fromEntries(
      Object.entries(query).filter(([_, queryValue]) => {
        return queryValue !== undefined;
      })
    );
    return filter(this.getSwapRoutes(), cleanQuery);
  }
  filterPools(query: Partial<constants.Pool>): constants.Pools {
    const cleanQuery: Partial<constants.Pool> = Object.fromEntries(
      Object.entries(query).filter((entry) => {
        return entry[1] !== undefined;
      })
    );
    return filter(this.getPools(), cleanQuery);
  }
  listToChains(): constants.ChainInfoList {
    const result: constants.ChainInfoList = [];
    constants.chainInfoList.forEach((chain) => {
      if (this.toChains.has(chain.chainId)) {
        result.push(chain);
      }
    });
    return result;
  }
  listFromChains(): constants.ChainInfoList {
    const result: constants.ChainInfoList = [];
    constants.chainInfoList.forEach((chain) => {
      if (this.fromChains.has(chain.chainId)) {
        result.push(chain);
      }
    });
    return result;
  }
  // this maintains order specified in the constants file in the chainInfoList
  getSpokeChains(): constants.ChainInfoList {
    const result: constants.ChainInfoList = [];
    constants.chainInfoList.forEach((chain) => {
      if (this.spokeChains.has(chain.chainId)) {
        result.push(chain);
      }
    });
    return result;
  }
  getSpokeChainIds(): constants.ChainId[] {
    return this.getSpokeChains()
      .map((chain) => chain.chainId)
      .filter(constants.isSupportedChainId);
  }
  isSupportedChainId = (chainId: number): boolean => {
    return (
      constants.isSupportedChainId(chainId) && this.spokeChains.has(chainId)
    );
  };
  getSupportedCanonicalNameAsChainId = (canonicalName?: string) => {
    // Returns undefined if the canonicalName is not defined
    if (!canonicalName) return;
    // Transform the canonical name to match ChainId key
    const modifiedCanonicalName = canonicalName.toLowerCase();
    // Attempt to resolve the chainId and return
    const resolvedChain = constants.CanonicalChainName[modifiedCanonicalName];
    return resolvedChain && this.isSupportedChainId(resolvedChain)
      ? resolvedChain
      : undefined;
  };
  /**
   * This function converts either a chainId or canonical name into a corresponding chainId.
   * @param chainIdOrCanonical Either a numeric string, an enumerated canonical name, undefined, or an invalid value.
   * @returns The chain ID in the valid case. NaN in the invalid case.
   */
  resolveChainIdFromNumericOrCanonical = (chainIdOrCanonical?: string) => {
    const asNumeric = Number(chainIdOrCanonical);
    return Number.isNaN(asNumeric)
      ? this.getSupportedCanonicalNameAsChainId(chainIdOrCanonical) ??
          Number(chainIdOrCanonical)
      : asNumeric;
  };
  getTokenList(chainId?: number): TokenList {
    return constants.tokenList.map((token) => {
      return {
        ...token,
        l1TokenAddress:
          token.addresses?.[chainId || constants.hubPoolChainId] ||
          token.mainnetAddress!,
        address:
          token.addresses?.[chainId || constants.hubPoolChainId] ||
          token.mainnetAddress!,
        isNative: token.symbol === "ETH",
      };
    });
  }
  // returns token list in order specified by constants, but adds in token address for the chain specified
  getRouteTokenList(chainId?: number): TokenList {
    const routeTable = Object.fromEntries(
      this.filterRoutes({ fromChain: chainId }).map((route) => {
        return [route.fromTokenSymbol, route];
      })
    );
    return constants.tokenList
      .filter((token: constants.TokenInfo) => routeTable[token.symbol])
      .map((token: constants.TokenInfo) => {
        const { fromTokenAddress, isNative, l1TokenAddress } =
          routeTable[token.symbol];
        return {
          ...token,
          address: fromTokenAddress,
          isNative,
          l1TokenAddress,
        };
      });
  }
  getTokenPoolList(chainId?: number): TokenList {
    const exclusivePools = this.filterPools({}).flatMap(
      (pool): (Token & { addresses: Record<string, string> })[] => {
        const token = constants.tokenList.find(
          (t) => t.symbol === pool.tokenSymbol
        );
        if (!token) return [];
        return [
          {
            isNative: pool.isNative,
            l1TokenAddress: token.mainnetAddress!,
            address: token.mainnetAddress!,
            ...token,
            addresses: {
              [constants.ChainId.MAINNET]: token.mainnetAddress!,
            },
          },
        ];
      }
    );
    return [...this.getRouteTokenList(chainId), ...exclusivePools];
  }
  getStakingPoolTokenList(chainId?: number): TokenList {
    return [
      ...this.getRouteTokenList(chainId),
      ...constants.externalLPsForStaking[
        chainId || constants.hubPoolChainId
      ].map((token) => {
        return {
          address: token.mainnetAddress!,
          isNative: false,
          l1TokenAddress: token.mainnetAddress!,
          ...token,
          addresses: {
            [constants.ChainId.MAINNET]: token.mainnetAddress!,
          },
        };
      }),
    ];
  }
  // this has a chance to mix up eth/weth which can be a problem. prefer token by symbol.
  getTokenInfoByAddress(
    chainId: number,
    address: string,
    tokens = this.getTokenList(chainId)
  ): Token {
    const token = tokens.find((token) => token.address === address);
    assert(
      token,
      `Token not found on chain: ${chainId} and address ${address}`
    );
    return token;
  }
  getPoolTokenInfoByAddress(chainId: number, address: string): Token {
    return this.getTokenInfoByAddress(
      chainId,
      address,
      this.getTokenPoolList(chainId)
    );
  }
  getTokenInfoByAddressSafe(
    chainId: number,
    address: string
  ): Token | undefined {
    try {
      return this.getTokenInfoByAddress(chainId, address);
    } catch (error) {
      return undefined;
    }
  }
  getTokenInfoBySymbol(chainId: number, symbol: string): Token {
    const tokens = this.getTokenList(chainId);
    return this._getTokenInfoBySymbol(chainId, symbol, tokens);
  }
  getTokenInfoBySymbolSafe(chainId: number, symbol: string): Token | undefined {
    try {
      return this.getTokenInfoBySymbol(chainId, symbol);
    } catch (error) {
      return undefined;
    }
  }
  getStakingPoolTokenInfoBySymbol(chainId: number, symbol: string): Token {
    const tokens = this.getStakingPoolTokenList(chainId);
    return this._getTokenInfoBySymbol(chainId, symbol, tokens);
  }
  getPoolTokenInfoBySymbol(chainId: number, symbol: string): Token {
    const tokens = this.getTokenPoolList(chainId);
    return this._getTokenInfoBySymbol(chainId, symbol, tokens);
  }
  _getTokenInfoBySymbol(
    chainId: number,
    symbol: string,
    srcTokenList: TokenList
  ): Token {
    const token = srcTokenList.find(
      (token) => token.symbol.toUpperCase() === symbol.toUpperCase()
    );
    assert(token, `Token not found on chain ${chainId} and symbol ${symbol}`);
    const tokenInfo = constants.getToken(symbol);
    return {
      ...tokenInfo,
      address: token.address,
      isNative: token.isNative,
      l1TokenAddress: token.l1TokenAddress,
    };
  }
  getTokenInfoByL1TokenAddress(chainId: number, l1TokenAddress: string): Token {
    const tokens = this.getTokenList(chainId);
    const token = tokens.find(
      (token) => token.l1TokenAddress === l1TokenAddress
    );
    assert(
      token,
      `Token not found on chain ${chainId} and l1TokenAddress ${l1TokenAddress}`
    );
    return token;
  }
  getFromToAddressesBySymbol(
    symbol: string,
    fromChainId: number,
    toChainId: number
  ) {
    const { l1TokenAddress } = this.getTokenInfoBySymbol(fromChainId, symbol);
    const fromAddress = this.getTokenInfoByL1TokenAddress(
      fromChainId,
      l1TokenAddress
    ).address;
    const toAddress = this.getTokenInfoByL1TokenAddress(
      toChainId,
      l1TokenAddress
    ).address;
    return { fromAddress, toAddress };
  }
  getNativeTokenInfo(chainId: number): constants.TokenInfo {
    const chainInfo = constants.getChainInfo(chainId);
    return constants.getToken(chainInfo.nativeCurrencySymbol);
  }
  canBridge(fromChain: number, toChain: number): boolean {
    const routes = this.filterRoutes({ fromChain, toChain });
    return routes.length > 0;
  }
  filterReachableTokens(fromChain: number, toChain?: number): TokenList {
    const routes = this.filterRoutes({ fromChain, toChain });
    const reachableTokens = routes.map((route) =>
      this.getTokenInfoBySymbol(fromChain, route.fromTokenSymbol)
    );
    // use token sorting when returning reachable tokens
    return sortBy(reachableTokens, (token) => this.tokenOrder[token.symbol]);
  }
  getPoolSymbols(): string[] {
    const tokenList = this.getStakingPoolTokenList(constants.hubPoolChainId);
    const poolSymbols = tokenList.map((token) => token.symbol.toLowerCase());
    return poolSymbols;
  }
  depositDelays() {
    try {
      const dd = process.env.REACT_APP_DEPOSIT_DELAY;
      if (dd) {
        return JSON.parse(dd) as DepositDelays;
      } else {
        return {};
      }
    } catch (err) {
      console.error(err);
      return {};
    }
  }
}

// singleton
let config: ConfigClient | undefined;
export function getConfig(): ConfigClient {
  if (config) return config;
  config = new ConfigClient(
    constants.routeConfig,
    constants.disabledBridgeTokens
  );
  return config;
}
