import { useState, useEffect } from 'react';
import { connectWallet, checkNetwork, formatAddress } from './utils/web3';
import Header from './components/Header';
import MiningPanel from './components/MiningPanel';
import ReferralPanel from './components/ReferralPanel';
import QuestPanel from './components/QuestPanel';
import ConvertPanel from './components/ConvertPanel';
import { EXPLORER_URL } from './utils/constants';
import { ethers } from 'ethers';
import './App.css';

export default function App() {
  const [userAddress, setUserAddress] = useState('');
  const [correctNetwork, setCorrectNetwork] = useState(false);
  const [activeTab, setActiveTab] = useState('mining');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          // Check if wallet is connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setUserAddress(accounts[0]);
          }
          
          // Check network
          const isCorrectNetwork = await checkNetwork();
          setCorrectNetwork(isCorrectNetwork);
          
          // Check for referral code in URL
          const urlParams = new URLSearchParams(window.location.search);
          const refCode = urlParams.get('ref');
          if (refCode && ethers.utils.isAddress(refCode)) {
            localStorage.setItem('referralCode', refCode);
          }
        } catch (err) {
          console.error("Initialization error:", err);
        }
      }
      setLoading(false);
    };

    init();

    // Event listeners for account and network changes
    const handleAccountsChanged = (accounts) => {
      setUserAddress(accounts[0] || '');
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      const address = await connectWallet();
      setUserAddress(address);
      setCorrectNetwork(true);
    } catch (err) {
      console.error("Wallet connection error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header 
        userAddress={userAddress} 
        onConnect={handleConnectWallet} 
        correctNetwork={correctNetwork}
      />
      
      <main className="main-content">
        {!userAddress ? (
          <div className="connect-wallet-prompt">
            <h2>Welcome to 0G Mining</h2>
            <p>Connect your wallet to start mining WH0G tokens</p>
            <button 
              onClick={handleConnectWallet}
              disabled={loading}
            >
              {loading ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        ) : !correctNetwork ? (
          <div className="wrong-network">
            <h2>Wrong Network</h2>
            <p>Please switch to 0G Testnet in your wallet to continue</p>
            <button onClick={handleConnectWallet}>
              Switch Network
            </button>
          </div>
        ) : (
          <>
            <div className="tabs">
              <button
                className={activeTab === 'mining' ? 'active' : ''}
                onClick={() => setActiveTab('mining')}
              >
                Mining
              </button>
              <button
                className={activeTab === 'referral' ? 'active' : ''}
                onClick={() => setActiveTab('referral')}
              >
                Referral
              </button>
              <button
                className={activeTab === 'quests' ? 'active' : ''}
                onClick={() => setActiveTab('quests')}
              >
                Quests
              </button>
              <button
                className={activeTab === 'convert' ? 'active' : ''}
                onClick={() => setActiveTab('convert')}
              >
                Convert
              </button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'mining' && <MiningPanel userAddress={userAddress} />}
              {activeTab === 'referral' && <ReferralPanel userAddress={userAddress} />}
              {activeTab === 'quests' && <QuestPanel />}
              {activeTab === 'convert' && <ConvertPanel userAddress={userAddress} />}
            </div>
          </>
        )}
      </main>
      
      <footer className="footer">
        <p>0G Mining Platform © {new Date().getFullYear()}</p>
        <p>
          <a href="https://0g.ai" target="_blank" rel="noopener noreferrer">0G Website</a> | 
          <a href={EXPLORER_URL} target="_blank" rel="noopener noreferrer">Block Explorer</a>
        </p>
      </footer>
    </div>
  );
}
