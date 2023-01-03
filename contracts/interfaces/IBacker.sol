// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.6.12;

interface IBacker {
  function backup(uint256 amount, address[] calldata path, uint256 deadline) external;
}