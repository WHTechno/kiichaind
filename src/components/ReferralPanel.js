import { useState, useEffect } from 'react';
import { getContract, formatAddress, formatBalance } from '../utils/web3';
import { MINING_CONTRACT_ADDRESS, MINING_CONTRACT_ABI } from '../utils/constants';

export default function ReferralPanel({ userAddress }) {
  const [referralData, setReferralData] = useState({
    count: 0,
    points: 0,
    bonusRate: 0,
    tier: ""
  });
  const [referralLink, setReferralLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userAddress) return;

    const fetchReferralData = async () => {
      try {
        setLoading(true);
        const contract = getContract(MINING_CONTRACT_ADDRESS, MINING_CONTRACT_ABI);
        
        const userData = await contract.getUserData(userAddress);
        const bonus = await contract.calculateReferralBonus(userAddress);
        
        // Determine tier
        let tier;
        const count = userData.referralCount;
        
        if (count >= 30) tier = "30% (30+ referrals)";
        else if (count >= 20) tier = "25% (20-29 referrals)";
        else if (count >= 10) tier = "20% (10-19 referrals)";
        else if (count >= 5) tier = "15% (5-9 referrals)";
        else if (count >= 1) tier = "10% (1-4 referrals)";
        else tier = "0% (No referrals)";
        
        setReferralData({
          count: userData.referralCount,
          points: formatBalance(userData.referralPoints),
          bonusRate: formatBalance(bonus),
          tier
        });
        
        setReferralLink(`${window.location.origin}?ref=${userAddress}`);
      } catch (err) {
        console.error("Error fetching referral data:", err);
        setError("Failed to load referral data");
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [userAddress]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied to clipboard!");
  };

  return (
    <div className="panel referral-panel">
      <h2>Referral Program</h2>
      
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      
      <div className="referral-stats">
        <div className="stat">
          <span className="label">Your Referrals</span>
          <span className="value">{referralData.count}</span>
        </div>
        
        <div className="stat">
          <span className="label">Bonus Points Earned</span>
          <span className="value">{referralData.points}</span>
        </div>
        
        <div className="stat">
          <span className="label">Current Bonus Rate</span>
          <span className="value">{referralData.bonusRate} points per referral</span>
        </div>
        
        <div className="stat">
          <span className="label">Your Tier</span>
          <span className="value">{referralData.tier}</span>
        </div>
      </div>
      
      <div className="referral-link-container">
        <h3>Your Referral Link</h3>
        <div className="referral-link">
          <input 
            type="text" 
            value={referralLink} 
            readOnly 
            onClick={(e) => e.target.select()}
          />
          <button onClick={copyReferralLink}>Copy</button>
        </div>
      </div>
      
      <div className="tier-info">
        <h3>Referral Tiers</h3>
        <ul>
          <li><strong>1-4 referrals:</strong> 10% bonus per referral</li>
          <li><strong>5-9 referrals:</strong> 15% bonus per referral</li>
          <li><strong>10-19 referrals:</strong> 20% bonus per referral</li>
          <li><strong>20-29 referrals:</strong> 25% bonus per referral</li>
          <li><strong>30+ referrals:</strong> 30% bonus per referral</li>
        </ul>
        <p>Bonus is calculated based on your referrals' mining activity</p>
      </div>
    </div>
  );
}
