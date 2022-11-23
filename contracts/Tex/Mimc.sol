pragma experimental ABIEncoderV2;
pragma solidity ^0.6.6;

import "hardhat/console.sol";

contract Mimc {
  function hash(
    address txOwner,
    bytes4 functionSelector,
    uint256 amountIn,
    uint256 amountOut,
    address[] memory path,
    address to,
    uint256 nonce,
    uint256 deadline
  ) public pure returns (bytes32) {  
    uint256[] memory _items = new uint256[](10);
    _items[0] = uint256(txOwner);
    _items[1] = uint256(bytes32(functionSelector) >> 224) ;
    _items[2] = amountIn;
    _items[3] = amountOut;
    _items[4] = uint256(to);
    _items[5] = uint256(nonce);
    _items[6] = uint256(deadline);

    uint16 i = 7;
    for(uint8 j = 0 ; j < path.length; j++) {
      _items[i] = uint256(path[j]);
      i++;
    }

    for(; i < 10; i++) {
      _items[i] = 0;
    }

    uint256 xl = _items[0];
    uint256[] memory _parameters = new uint256[](2);
    _parameters[0] = 0x0000000000000000000000000000000000000000000000000000000000000001;
    _parameters[1] = 0x0000000000000000000000000000000000000000000000000000000000000002;

    assembly {
      let primeFieldModulus := 0x73EDA753299D7D483339D80809A1D80553BDA402FFFE5BFEFFFFFFFF00000001
      let items := add(_items, 0x20)
      let itemLength := mload(_items)
      let parameterLength := mload(_parameters)
    
      for { i := 1 } lt(i, itemLength) { i := add(i, 1) } {
        let xr := mload(add(items, mul(i, 0x20)))
        
        let parameterArray := add(_parameters, 0x20)
        for { let j := 0 } lt(j, parameterLength) { j := add(j, 1) } {
          let parameter := mload(add(parameterArray, mul(j, 0x20)))
          
          let temp1 := xl
          temp1 := addmod(temp1, parameter, primeFieldModulus)
          
          let temp2 := mulmod(temp1, temp1, primeFieldModulus)
          temp2 := mulmod(temp2, temp1, primeFieldModulus)
          temp2 := addmod(temp2, xr, primeFieldModulus)
          
          xr := xl
          xl := temp2
        }
      }
    }

    return bytes32(xl);
  }
}