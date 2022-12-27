// SPDX-License-Identifier: AGPL-3.0
pragma solidity =0.6.6;

interface IFlashLoan {
  function flashloan(address _assetAddress, uint256 amount, bytes calldata params) external;
}