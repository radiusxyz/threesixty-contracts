// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import {IERC20} from './interfaces/IERC20.sol';
import {IUniswapV2Router02} from '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import {DataTypes} from './protocol/libraries/types/DataTypes.sol';

import "./FlashLoanSimpleReceiverBase.sol";
contract Backer is FlashLoanSimpleReceiverBase {
    address payable owner;
    
    address assetAddress;
    address routerAddress = 0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff;

    event Withdrawal(uint256 amount, uint256 debt);

    error NotOwner();
    error NotEnoughFunds();

    constructor (address _poolAddressesProvider) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_poolAddressesProvider)) {
        owner = payable(msg.sender);
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool) {
        IERC20 token = IERC20(asset);

        (uint256 amountIn, address[] memory path, uint256 deadline) = abi.decode(params, (uint256, address[], uint256));    
    
        token.approve(address(routerAddress), amountIn);
        uint256[] memory amounts = IUniswapV2Router02(routerAddress).swapExactTokensForTokens(amountIn, 0, path, address(this), deadline);

        uint256 debt = amount + premium;
        if (amounts[amounts.length - 1] < debt) revert NotEnoughFunds();
        token.approve(address(POOL), debt);

        return true;
    }

    function backup(
        uint256 amount,
        address[] calldata path,
        uint256 deadline
    ) external {
        uint16 referralCode = 0;
        bytes memory data = abi.encode(amount, path, deadline);
        POOL.flashLoanSimple(address(this), path[0], amount, data, referralCode);
    }
}
