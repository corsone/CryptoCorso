/// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

library SafeMath {
    function add(uint a, uint b) internal pure returns(uint){
        uint result = a + b;
        unchecked {
            require(result >= a, 'Arithmetic overflow');
        }

        return result;
    }

    function sub(uint a, uint b) internal pure returns(uint){
        unchecked {
            require(a - b >= 0, 'Arithmetic underflow');
        }
        return a - b;
    }
}