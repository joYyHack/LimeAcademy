// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

abstract contract Ownable {
    address public owner;

    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not an owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }
}
