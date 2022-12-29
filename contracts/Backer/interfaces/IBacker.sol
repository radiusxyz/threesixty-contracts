// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.6.6 || ^0.8.10;

interface IBacker {
  function swap(uint256 amountIn, address[] calldata path, uint256 deadline) external;
}