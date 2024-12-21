// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockERC721 is ERC721 {

    mapping (uint256 => string) public tokenURIs;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
    }

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function mintURI(address to, uint256 tokenId, string memory _tokenURI) public {
        _mint(to, tokenId);
        tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        return tokenURIs[tokenId];
    }

}