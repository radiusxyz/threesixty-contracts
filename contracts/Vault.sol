// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.12;

import "./interfaces/IERC20.sol";

contract Vault {
    address public tokenAddress;
    address public owner;
    address public router;

    constructor(address _tokenAddress) public {
        tokenAddress = _tokenAddress;
        owner = msg.sender;
    }

    function setRouter(address _router) external {
        require(msg.sender == owner, "Vault: Not approved owner");
        router = _router;
    }

    function deposit(uint256 amount) public  {
        require(IERC20(tokenAddress).balanceOf(msg.sender) >= amount, "Your token amount must be greater then you are trying to deposit");
        require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount));
    }

    function getDeposit() public view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    function withdraw(address to, uint256 amount) public {
        require(msg.sender == router);
        require(IERC20(tokenAddress).balanceOf(address(this)) >= amount);
        require(IERC20(tokenAddress).transfer(to, amount), "the transfer failed");
    }
}
