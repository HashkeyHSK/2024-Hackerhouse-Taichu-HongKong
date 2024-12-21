// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

library Uint112Library {
    function toUint112(uint x) internal pure returns (uint112 y) {
        y = uint112(x);
        require(x == y, "toUint112: overflow");
    }

    function toUint32(uint x) internal pure returns (uint32 y) {
        y = uint32(x);
        require(x == y, "toUint32: overflow");
    }
}
