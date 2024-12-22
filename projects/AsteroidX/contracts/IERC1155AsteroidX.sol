// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC1155AsteroidX {

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function fundsWallet(uint256 _id) external view returns(address); 

    function buy(address userAddress, uint256 id, uint256 amount) external returns(bool);

}