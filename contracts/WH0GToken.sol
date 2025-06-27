// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WH0GToken is ERC20, Ownable {
    address public miningContract;

    constructor() ERC20("WH0G Token", "WH0G") {}

    function setMiningContract(address _miningContract) external onlyOwner {
        miningContract = _miningContract;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == miningContract, "Only mining contract can mint");
        _mint(to, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
}
