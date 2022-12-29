
pragma solidity =0.6.6;

import "@uniswap/v2-periphery/contracts/UniswapV2Router02.sol";

contract Tester {
  bytes32 private h;

  constructor() public {}

  function ha() public view returns (bytes32) {
    return h;
  }

  function setHa(bytes32 _h) public {
    //console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
    h = _h;
  }

  function swapExactTokensForTokens(
    uint256 amountIn,
    uint256 amountOutMin,
    address[] memory path,
    address to,
    uint256 deadline
  ) public {
    bytes32 _h = keccak256(
      abi.encodePacked(msg.sender, amountIn, amountOutMin, path, to, deadline)
    );
    require(_h == h);
    h = 0;
  }

  function getTxId(
    uint256 amountIn,
    uint256 amountOutMin,
    address[] memory path,
    address to,
    uint256 deadline
  ) public view returns (bytes32) {
    return
      keccak256(
        abi.encodePacked(msg.sender, amountIn, amountOutMin, path, to, deadline)
      );
  }
}
