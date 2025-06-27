import { useState, useEffect } from 'react';
import { getContract, formatBalance, formatAddress } from '../utils/web3';
import { MINING_CONTRACT_ADDRESS, MINING_CONTRACT_ABI } from '../utils/constants';

export default function MiningPanel({ userAddress }) {
  const [miningData, setMiningData] = useState({
    isActive: false,
    points: 0,
    lastMineTime: 0,
    referrer: null,
    canClaim: false
  });
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userAddress) return;

    const fetchMiningData = async () => {
      try {
        setLoading(true);
        const contract = getContract(MINING_CONTRACT_ADDRESS, MINING_CONTRACT_ABI);
        const userData = await contract.getUserData(userAddress);
        
        const now = Math.floor(Date.now() / 1000);
        const cooldown = 24 * 60 * 60;
        const canClaim = userData.isActive && now >= userData.lastMineTime + cooldown;
        
        setMiningData({
          isActive: userData.isActive,
          points: formatBalance(userData.points),
          lastMineTime: userData.lastMineTime,
          referrer: userData.referrer,
          canClaim
        });
      } catch (err) {
        console.error("Error fetching mining data:", err);
        setError("Failed to load mining data");
      } finally {
        setLoading(false);
      }
    };

    fetchMiningData();
    
    // Refresh every minute
    const interval = setInterval(fetchMiningData, 60000);
    return () => clearInterval(interval);
  }, [userAddress]);

  const handleStartMining = async () => {
    try {
      setLoading(true);
      setError('');
      const contract = getContract(MINING_CONTRACT_ADDRESS, MINING_CONTRACT_ABI);
      
      let referrerAddress = ethers.constants.AddressZero;
      if (referralCode && ethers.utils.isAddress(referralCode)) {
        referrerAddress = referralCode;
      }
      
      const tx = await contract.startMining(referrerAddress);
      await tx.wait();
      
      // Refresh data
      const userData = await contract.getUserData(userAddress);
      setMiningData(prev => ({
        ...prev,
        isActive: userData.isActive,
        lastMineTime: userData.lastMineTime,
        referrer: userData.referrer
      }));
    } catch (err) {
      console.error("Error starting mining:", err);
      setError(err.message || "Failed to start mining");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimPoints = async () => {
    try {
      setLoading(true);
      setError('');
      const contract = getContract(MINING_CONTRACT_ADDRESS, MINING_CONTRACT_ABI);
      const tx = await contract.claimPoints();
      await tx.wait();
      
      // Refresh data
      const userData = await contract.getUserData(userAddress);
      const now = Math.floor(Date.now() / 1000);
      const cooldown = 24 * 60 * 60;
      
      setMiningData(prev => ({
        ...prev,
        points: formatBalance(userData.points),
        lastMineTime: userData.lastMineTime,
        canClaim: now >= userData.lastMineTime + cooldown
      }));
    } catch (err) {
      console.error("Error claiming points:", err);
      setError(err.message || "Failed to claim points");
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeRemaining = () => {
    if (!miningData.isActive || miningData.canClaim) return null;
    
    const now = Math.floor(Date.now() / 1000);
    const remaining = miningData.lastMineTime + (24 * 60 * 60) - now;
    
    if (remaining <= 0) return "Now";
    
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="panel mining-panel">
      <h2>Mining Dashboard</h2>
      
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      
      {!miningData.isActive ? (
        <div className="start-mining">
          <h3>Start Mining</h3>
          <p>Earn 100 points every 24 hours</p>
          
          <div className="referral-input">
            <label htmlFor="referral-code">Referral Code (optional)</label>
            <input
              id="referral-code"
              type="text"
              placeholder="0x..."
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
          </div>
          
          <button 
            onClick={handleStartMining}
            disabled={loading}
          >
            {loading ? "Starting..." : "Start Mining"}
          </button>
        </div>
      ) : (
        <div className="mining-status">
          <div className="stats">
            <div className="stat">
              <span className="label">Your Points</span>
              <span className="value">{miningData.points}</span>
            </div>
            
            <div className="stat">
              <span className="label">Last Claim</span>
              <span className="value">
                {new Date(miningData.lastMineTime * 1000).toLocaleString()}
              </span>
            </div>
            
            {miningData.referrer && miningData.referrer !== ethers.constants.AddressZero && (
              <div className="stat">
                <span className="label">Referred By</span>
                <span className="value">{formatAddress(miningData.referrer)}</span>
              </div>
            )}
          </div>
          
          {miningData.canClaim ? (
            <button 
              onClick={handleClaimPoints}
              disabled={loading}
            >
              {loading ? "Processing..." : "Claim Points"}
            </button>
          ) : (
            <div className="cooldown">
              <p>Next claim available in: {calculateTimeRemaining()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
