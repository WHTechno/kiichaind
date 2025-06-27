export const CHAIN_ID = 16601;
export const RPC_URL = "https://evmrpc-testnet.0g.ai";
export const EXPLORER_URL = "https://chainscan-galileo.0g.ai";
export const NATIVE_CURRENCY = {
  name: "0G Native",
  symbol: "0G",
  decimals: 18
};

export const NETWORK_CONFIG = {
  chainId: `0x${CHAIN_ID.toString(16)}`,
  chainName: "0G Testnet",
  nativeCurrency: NATIVE_CURRENCY,
  rpcUrls: [RPC_URL],
  blockExplorerUrls: [EXPLORER_URL]
};

export const MINING_CONTRACT_ADDRESS = "0x..."; // Replace after deployment
export const WH0G_TOKEN_ADDRESS = "0x..."; // Replace after deployment

export const MINING_CONTRACT_ABI = [
  // Paste the ABI generated from MiningContract.sol
];

export const WH0G_TOKEN_ABI = [
  // Paste the ABI generated from WH0GToken.sol
];
