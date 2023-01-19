pragma solidity >=0.6.2;

import "./IThreesixtyRouter01.sol";

interface IThreesixtyRouter02 is IThreesixtyRouter01 {
  function swapExactTokensForTokensSupportingFeeOnTransferTokens(
    address origin,
    uint256 amountIn,
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  ) external;

  function swapExactETHForTokensSupportingFeeOnTransferTokens(
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  ) external payable;

  function swapExactTokensForETHSupportingFeeOnTransferTokens(
    address origin,
    uint256 amountIn,
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  ) external;
}
