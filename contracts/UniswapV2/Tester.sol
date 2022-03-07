pragma solidity =0.6.6;

import "./libraries/UniswapV2Library.sol";
import "./libraries/TransferHelper.sol";

contract Tester {
  function getPair(
    address factory,
    address tokenA,
    address tokenB
  ) public pure returns (address pair) {
    pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);
  }

  function test2(
    address factory,
    address tokenA,
    address tokenB
  ) public view returns (uint256 reserveA, uint256 reserveB) {
    (reserveA, reserveB) = UniswapV2Library.getReserves(
      factory,
      tokenA,
      tokenB
    );
  }

  // approve(address,uint256)
  function test3() public pure returns (bytes4 stringByte) {
    stringByte = bytes4(keccak256(bytes("approve(address,uint256)")));
  }

  // transfer(address,uint256)
  function test4() public pure returns (bytes4 stringByte) {
    stringByte = bytes4(keccak256(bytes("transfer(address,uint256)")));
  }

  // transferFrom(address,address,uint256)
  function test5() public pure returns (bytes4 stringByte) {
    stringByte = bytes4(
      keccak256(bytes("transferFrom(address,address,uint256)"))
    );
  }

  function test6(
    address token,
    address to,
    uint256 amount
  ) public returns (uint256 result) {
    TransferHelper.safeTransferFrom(token, msg.sender, to, amount);
    result = amount;
  }
}
