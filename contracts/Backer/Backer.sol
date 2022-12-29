// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IUniswapV2Router02} from '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import {DataTypes} from './protocol/libraries/types/DataTypes.sol';

import "./FlashLoanSimpleReceiverBase.sol";
import "./interfaces/IBacker.sol";

contract Backer is FlashLoanSimpleReceiverBase, IBacker {
    address payable owner;
    
    address assetAddress;
    address routerAddress = 0x8954AfA98594b838bda56FE4C12a09D7739D179b;

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

    function swap(
        uint256 amountIn,
        address[] calldata path,
        uint256 deadline
    ) external {
        uint16 referralCode = 0;
        bytes memory data = abi.encode(amountIn, path, deadline);
        POOL.flashLoanSimple(address(this), path[0], amountIn, data, referralCode);
    }
}