import { formatAddress } from '../utils/web3';

export default function Header({ userAddress, onConnect, correctNetwork }) {
  return (
    <header className="header">
      <div className="logo">
        <h1>0G Mining</h1>
      </div>
      
      <div className="wallet-info">
        {userAddress ? (
          <div className="connected-wallet">
            <span className={`network-status ${correctNetwork ? 'connected' : 'disconnected'}`}>
              {correctNetwork ? 'Connected' : 'Wrong Network'}
            </span>
            <span className="wallet-address">{formatAddress(userAddress)}</span>
          </div>
        ) : (
          <button className="connect-button" onClick={onConnect}>
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
