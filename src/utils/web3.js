import { NETWORK_CONFIG, CHAIN_ID } from './constants';
import { ethers } from 'ethers';

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  try {
    // Check if the correct network is connected
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (currentChainId !== `0x${CHAIN_ID.toString(16)}`) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORK_CONFIG]
        });
      } catch (addError) {
        console.error("Error adding 0G network:", addError);
        throw new Error("Failed to add 0G network");
      }
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
};

export const checkNetwork = async () => {
  if (!window.ethereum) return false;
  
  try {
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    return currentChainId === `0x${CHAIN_ID.toString(16)}`;
  } catch (error) {
    console.error("Error checking network:", error);
    return false;
  }
};

export const getContract = (address, abi) => {
  if (!window.ethereum) {
    throw new Error("Ethereum provider not found");
  }
  
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(address, abi, signer);
};

export const formatAddress = (address) => {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const formatBalance = (balance, decimals = 18) => {
  if (!balance) return "0";
  return ethers.utils.formatUnits(balance, decimals);
};
