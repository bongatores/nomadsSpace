// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "base64-sol/base64.sol";

interface Helper {
  function TuringRandom() external returns (uint256);
}

 contract TuringConsumer is Ownable {


   address public helperAddr;
   Helper helper;

   mapping(uint8 => mapping(uint8 => bool)) public posOccupied;
   mapping(uint8 => mapping(uint8 => address)) public posOccupier;
   mapping(uint8 => mapping(uint8 => string)) public uri;
   using SafeMath for uint256;

   event Result(string uri,uint256 number,bool result,uint8 x,uint8 z);

   constructor(address _helper) {
       helperAddr = _helper;
       helper = Helper(helperAddr);
   }


   // Assumes the subscription is funded sufficiently.
   function requestRandomWords(string memory _uri,uint8[2] memory coords) external payable {
     require(msg.value == 0.001 ether);
     uint256 amountOwner = msg.value.mul(3).div(10);
     if(!posOccupied[coords[0]][coords[1]]){
       posOccupier[coords[0],coords[1]] = msg.sender;
       uri[coords[0]][coords[1]] = _uri;
       posOccupied[coords[0]][coords[1]] = true;
       amountOwner = msg.value;
       emit Result(_uri,0,true,coords[0],coords[1]);
     } else {
       address occupier = posOccupier[coords[0],coords[1]];
       uint256 turingRAND = helper.TuringRandom();
       bool result = false;
       if(turingRAND.mod(10) <= 2){
         result = true;
         uri[coords[0]][coords[1]] = _uri;
       }
       (success, ) = payable(occupier).call{value: msg.value.sub(amountOwner)}("");
       require(success);
       emit Result(_uri,turingRAND,result,coords[0],coords[1]);
     }
     (success, ) = payable(owner()).call{value: amountOwner}("");
     require(success);
   }

 }
