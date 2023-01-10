//SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.12;

contract Recorder {
  uint256 public currentRound;
  uint256 public currentIndex;

  address public router;
  address public operator;

  mapping(uint256 => bool) public isSaved;
  mapping(uint256 => bytes32[]) public roundTxHashes;
  mapping(bytes32 => mapping(address => bool)) public useOfVeto;
  mapping(bytes32 => bool) public skippedTxHashes;
  mapping(bytes32 => bool) public reimbursedTxHashes;

  event Commit(uint256 round, uint256 index);

  constructor(address _operator) public {
    router = msg.sender;
    operator = _operator;
  }

  modifier onlyRouter() {
    require(msg.sender == router);
    _;
  }

  modifier onlyOperator() {
    require(msg.sender == operator);
    _;
  }

  function getRoundTxHashes(uint256 _round) public view returns (bytes32[] memory) {
    uint256 round = _round;
    return roundTxHashes[round];
  }

  function setOperator(address newOperator) public onlyRouter {
    operator = newOperator;
  }

  function addTxHashes(bytes32[] memory _txHashes) public onlyOperator {
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

  function validate(bytes32 _txHash) public view returns (bool) {
    return (roundTxHashes[currentRound][currentIndex] == _txHash);
  }

  function isDisabledTx(bytes32 _txHash, address _txOwner) public view returns (bool) {
    return (useOfVeto[_txHash][_txOwner] == true);
  }

  function goForward() public onlyRouter {
    emit Commit(currentRound, currentIndex);
    if (roundTxHashes[currentRound].length == currentIndex + 1) {
      currentRound++;
      currentIndex = 0;
    } else currentIndex++;
  }

  function skipRound() public onlyOperator {
    for (uint256 i = 0; i < roundTxHashes[currentRound].length; i++) {
      skippedTxHashes[roundTxHashes[currentRound][i]] = true;
    }    
    currentRound++;
    currentIndex = 0;
  }

  function setReimbursedTxHashes(bytes32 _txHash) public onlyRouter {
    reimbursedTxHashes[_txHash] = true;
  }
}