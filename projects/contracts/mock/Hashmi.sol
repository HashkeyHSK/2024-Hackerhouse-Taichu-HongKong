// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract Hashmi is ERC20 {

    constructor() ERC20(unicode"Hashmi ʕ◉ᴥ◉ʔ", "HSM") {
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 9;
    }

    function tokenURI() public pure returns (string memory output) {
        string[3] memory parts;
        parts[0] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: serif; font-size: 80px; }</style><rect width="100%" height="100%" fill="black" /><text x="40" y="180" class="base">';
        parts[1] = unicode'ʕ◉ᴥ◉ʔ';
        parts[2] = '</text></svg>';

        output = string(abi.encodePacked(parts[0], parts[1], parts[2]));
        string memory json = Base64.encode(bytes(string(abi.encodePacked(unicode'{"description":Hashmi ʕ◉ᴥ◉ʔ is a code cat, he loves coding and bitcoin.", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)), '"}'))));
        output = string(abi.encodePacked('data:application/json;base64,', json));
    }
}