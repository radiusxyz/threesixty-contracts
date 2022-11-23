//SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.6;

contract Recorder {
  uint256 public currentRound;
  uint256 public currentIndex;

  address public owner;

  mapping(uint256 => bool) public isSaved;
  mapping(uint256 => bytes32[]) public roundTxHashes;
  mapping(bytes32 => mapping(address => bool)) public useOfVeto;
  mapping(bytes32 => bool) public skippedTxHashes;

  event Commit(uint256 round, uint256 index);

  constructor() public {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    owner = newOwner;
  }

  function addTxHashes(bytes32[] memory _txHashes) public onlyOwner {
    require(!isSaved[currentRound]);
    bool result;
    for (uint256 i = 0; i < _txHashes.length; i++) {
      result = result || skippedTxHashes[_txHashes[i]]; 
    }
    require(!result);
    roundTxHashes[currentRound] = _txHashes;
    isSaved[currentRound] = true;
    currentIndex = 0;
  }

  function disableTxHash(bytes32 _txHash) public {
    useOfVeto[_txHash][msg.sender] = true;
  }

  function validate(bytes32 _txHash, address _txOwner) public view returns (bool) {
    if (roundTxHashes[currentRound][currentIndex] == _txHash && useOfVeto[_txHash][_txOwner] != true) return true;
    return false;
  }

  function goForward() public onlyOwner {
    emit Commit(currentRound, currentIndex);
    if (roundTxHashes[currentRound].length == currentIndex + 1) {
      currentRound++;
      currentIndex = 0;
    } else currentIndex++;
  }

  function skipRound() public onlyOwner {
    for (uint256 i = 0; i < roundTxHashes[currentRound].length; i++) {
      skippedTxHashes[roundTxHashes[currentRound][i]] = true;
    }    
    currentRound++;
    currentIndex = 0;
  }
}