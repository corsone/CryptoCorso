/// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

library String {
    function isEmpty(string memory s) internal pure returns (bool) {
        return bytes(s).length > 0;
    }

    function isEqual(string memory a, string memory b) internal pure returns(bool){
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}