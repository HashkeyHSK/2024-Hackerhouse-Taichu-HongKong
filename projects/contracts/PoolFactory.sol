// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./Pool.sol";

contract PoolFactory {

    mapping(address => bool) public pools;

    event PoolCreated(address pool, address v3PoolAddr);

    constructor() {
    }

    // function createPool(address v3PoolAddr, address stableTokenAddr) public returns (address) {
    //     Pool pool = new Pool(v3PoolAddr, stableTokenAddr);
    //     pools[address(pool)] = true;
    //     emit PoolCreated(address(pool), v3PoolAddr);
    //     return address(pool);
    // }
}
