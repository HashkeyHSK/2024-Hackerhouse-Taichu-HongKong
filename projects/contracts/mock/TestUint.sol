// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract TestUint {

    function getValue(uint112 token1InUsed, uint112 token1In) public pure returns (uint32) {
        // console.log("uint112 max:", type(uint112).max, "uint32 max:", type(uint32).max);

        uint p112 = uint(token1InUsed) * type(uint32).max / token1In;
        console.log("p112:", p112);
        uint32 p32 = uint32(uint(token1InUsed) * type(uint32).max / token1In);
        console.log("p32:", p32);
        return p32 + 1;
    }
}
