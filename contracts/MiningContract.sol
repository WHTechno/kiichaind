// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./WH0GToken.sol";

contract MiningContract is Ownable {
    struct User {
        uint256 points;
        uint256 wh0gBalance;
        uint256 lastMineTime;
        address referrer;
        uint256 referralCount;
        uint256 referralPoints;
        bool isActive;
    }

    mapping(address => User) public users;
    address[] public userAddresses;
    
    WH0GToken public wh0gToken;
    
    uint256 public constant BASE_MINING_RATE = 100 ether; // 100 points with 18 decimals
    uint256 public constant CLAIM_COOLDOWN = 24 hours;
    uint256 public constant CONVERSION_RATE = 100; // 100:1 ratio
    
    event MiningStarted(address indexed user, address indexed referrer);
    event PointsClaimed(address indexed user, uint256 points);
    event TokensConverted(address indexed user, uint256 points, uint256 tokens);
    event ReferralAdded(address indexed referrer, address indexed referee);

    constructor(address _wh0gToken) {
        wh0gToken = WH0GToken(_wh0gToken);
    }

    function startMining(address referrer) external {
        User storage user = users[msg.sender];
        
        require(!user.isActive, "Mining already active");
        
        user.isActive = true;
        user.lastMineTime = block.timestamp;
        userAddresses.push(msg.sender);
        
        if (referrer != address(0) && referrer != msg.sender && users[referrer].isActive) {
            user.referrer = referrer;
            users[referrer].referralCount++;
            emit ReferralAdded(referrer, msg.sender);
        }
        
        emit MiningStarted(msg.sender, referrer);
    }

    function claimPoints() external {
        User storage user = users[msg.sender];
        
        require(user.isActive, "Mining not started");
        require(block.timestamp >= user.lastMineTime + CLAIM_COOLDOWN, "Cooldown not passed");
        
        uint256 points = BASE_MINING_RATE;
        
        // Calculate referral bonus
        if (user.referrer != address(0)) {
            uint256 referralBonus = calculateReferralBonus(user.referrer);
            users[user.referrer].referralPoints += referralBonus;
            points += referralBonus;
        }
        
        user.points += points;
        user.lastMineTime = block.timestamp;
        
        emit PointsClaimed(msg.sender, points);
    }

    function calculateReferralBonus(address referrer) public view returns (uint256) {
        uint256 count = users[referrer].referralCount;
        uint256 percentage;
        
        if (count >= 30) percentage = 30;
        else if (count >= 20) percentage = 25;
        else if (count >= 10) percentage = 20;
        else if (count >= 5) percentage = 15;
        else if (count >= 1) percentage = 10;
        else return 0;
        
        return (BASE_MINING_RATE * percentage) / 100;
    }

    function convertToWH0G() external {
        User storage user = users[msg.sender];
        require(user.points >= CONVERSION_RATE * 1 ether, "Not enough points");
        
        uint256 tokens = user.points / (CONVERSION_RATE * 1 ether);
        user.points -= tokens * CONVERSION_RATE * 1 ether;
        user.wh0gBalance += tokens;
        
        wh0gToken.mint(msg.sender, tokens * 1 ether);
        emit TokensConverted(msg.sender, tokens * CONVERSION_RATE * 1 ether, tokens);
    }

    function getUserData(address userAddress) external view returns (User memory) {
        return users[userAddress];
    }

    function totalUsers() external view returns (uint256) {
        return userAddresses.length;
    }
}
