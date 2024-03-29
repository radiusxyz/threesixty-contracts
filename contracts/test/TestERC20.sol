// SPDX-License-Identifier: MIT
pragma solidity =0.6.12;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract TestERC20 is ERC20 {
    constructor(string memory name, string memory symbol, uint256 amount) public ERC20(name, symbol) {
        _mint(msg.sender, amount);
    }
}