//SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.6;

contract Recorder {
  uint256 public currentRound;
  uint256 public currentIndex;

  address public owner;

  event Commit(uint256 round, uint256 index);

  constructor() public {
    currentRound = 0;
    currentIndex = 0;
    owner = msg.sender;
  }

  mapping(uint256 => bool) public isSaved;
  mapping(uint256 => bytes32[]) public roundTxIdList;
  mapping(bytes32 => address) public txOwners;

  function addTxIds(bytes32[] memory _txList) public {
    //Should be included
    //require(isSaved[currentRound] == false);
    roundTxIdList[currentRound] = _txList;
    isSaved[currentRound] = true;
  }

  function cancelTxId(bytes32 _txId) public {
    require(txOwners[_txId] == msg.sender);
    txOwners[_txId] = address(0x0);
  }

  function validate(bytes32 _txId) public view returns (bool) {
    if (roundTxIdList[currentRound][currentIndex] == _txId && txOwners[_txId] != address(0x0)) return true;
    return false;
  }

  function goForward() public {
    emit Commit(currentRound, currentIndex);
    currentIndex++;
    if (roundTxIdList[currentRound].length == currentIndex) {
      currentRound++;
      currentIndex = 0;
    }
  }
}
