import { useState, useEffect } from 'react';
import { getContract, formatBalance } from '../utils/web3';
import { MINING_CONTRACT_ADDRESS, MINING_CONTRACT_ABI } from '../utils/constants';

export default function ConvertPanel({ userAddress }) {
  const [conversionData, setConversionData] = useState({
    points: 0,
    wh0g: 0,
    conversionRate: 100
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!userAddress) return;

    const fetchConversionData = async () => {
      try {
        setLoading(true);
        const contract = getContract(MINING_CONTRACT_ADDRESS, MINING_CONTRACT_ABI);
        const userData = await contract.getUserData(userAddress);
        
        setConversionData({
          points: formatBalance(userData.points),
          wh0g: formatBalance(userData.wh0gBalance),
          conversionRate: 100
        });
      } catch (err) {
        console.error("Error fetching conversion data:", err);
        setError("Failed to load conversion data");
      } finally {
        setLoading(false);
      }
    };

    fetchConversionData();
  }, [userAddress]);

  const handleConvert = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const contract = getContract(MINING_CONTRACT_ADDRESS, MINING_CONTRACT_ABI);
      const tx = await contract.convertToWH0G();
      await tx.wait();
      
      // Refresh data
      const userData = await contract.getUserData(userAddress);
      setConversionData({
        points: formatBalance(userData.points),
        wh0g: formatBalance(userData.wh0gBalance),
        conversionRate: 100
      });
      
      setSuccess("Successfully converted points to WH0G tokens!");
    } catch (err) {
      console.error("Error converting points:", err);
      setError(err.message || "Failed to convert points");
    } finally {
      setLoading(false);
    }
  };

  const canConvert = parseFloat(conversionData.points) >= conversionData.conversionRate;

  return (
    <div className="panel convert-panel">
      <h2>Convert Points to WH0G</h2>
      
      {loading && <div className="loading">Processing...</div>}
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <div className="conversion-info">
        <p>Conversion rate: 100 points = 1 WH0G</p>
        
        <div className="balances">
          <div className="balance">
            <span className="label">Your Points:</span>
            <span className="value">{conversionData.points}</span>
          </div>
          
          <div className="balance">
            <span className="label">Your WH0G:</span>
            <span className="value">{conversionData.wh0g}</span>
          </div>
        </div>
      </div>
      
      <button 
        onClick={handleConvert}
        disabled={!canConvert || loading}
        className={`convert-button ${!canConvert ? 'disabled' : ''}`}
      >
        {loading ? "Converting..." : "Convert 100 Points to 1 WH0G"}
      </button>
      
      {!canConvert && (
        <p className="notice">You need at least 100 points to convert</p>
      )}
    </div>
  );
}
