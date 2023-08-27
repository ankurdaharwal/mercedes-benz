/**
 *  Author  : Ankur Daharwal (@ankurdaharwal)
 *  Project : MercedesBenz
 *  Tags    : Cars, Collectibles, NFT, Metaverse, Mercedes Benz
 *  File    : MercedesBenz.sol
 */

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./ERC721A.sol";
import "hardhat/console.sol";

contract MercedesBenz is Ownable, ERC721A, ReentrancyGuard {
  
  uint8 public constant COLLECTION_SIZE = 5;
  uint8 public constant MAX_MINT_PER_ADDRESS = 1;

  struct Config {
    uint256 mintStartTime;
    uint256 mintEndTime;
  }

  Config public config;

  // A mapping from an address => the NFTs tokenId.
  // NFT token holder register for future reference.
  mapping(address => uint256) public nftHolders;

  // Events
  event MercedesBenzNFTMinted(
        address indexed owner,
        uint256 tokenId
  );

  constructor(
    uint32 configMintStartTime,
    uint32 configMintEndTime
  ) ERC721A("MercedesBenz", "MBNFT", MAX_MINT_PER_ADDRESS, COLLECTION_SIZE) {
    
    // minting period checks
    require(configMintStartTime > 0, "mint start time must be in the future");
    require(configMintStartTime <= configMintEndTime, "mint start time must be before mint end time");
    config.mintStartTime = block.timestamp + configMintStartTime;
    config.mintEndTime = block.timestamp + configMintEndTime;
  }

  modifier callerIsUser() {
    require(tx.origin == msg.sender, "The caller is another contract");
    _;
  }
  
  function mint()
    external
    callerIsUser
  {
    uint256 mintStartTime = uint256(config.mintStartTime);
    uint256 mintEndTime = uint256(config.mintEndTime);
    uint256 tokenId = totalSupply() + 1;
    
    require(
      isMintingLive(mintStartTime, mintEndTime),
      "minting is not live yet or has ended"
    );
    require(tokenId <= COLLECTION_SIZE, "reached max supply");
    require(
      numberMinted(msg.sender) + 1 <= MAX_MINT_PER_ADDRESS,
      "can not mint this many"
    );
    _safeMint(msg.sender, MAX_MINT_PER_ADDRESS);
    nftHolders[msg.sender] = tokenId;
    emit MercedesBenzNFTMinted(msg.sender, tokenId);
  }

  function isMintingLive(
    uint256 mintStartTime,
    uint256 mintEndTime
  ) public view returns (bool) {
    return
      block.timestamp >= mintStartTime && block.timestamp <= mintEndTime;
  }

  function checkIfUserHasNFT() public view returns (uint256) {
    // Get the tokenId of the user's mercedes-benz NFT
    uint256 tokenId = nftHolders[msg.sender];
    return tokenId;
  }

  // // metadata URI
  string private _baseTokenURI;

  function _baseURI() internal view virtual override returns (string memory) {
    return _baseTokenURI;
  }

  function setBaseURI(string calldata baseURI) external onlyOwner {
    _baseTokenURI = baseURI;
  }

  function setOwnersExplicit(uint256 quantity) external onlyOwner nonReentrant {
    _setOwnersExplicit(quantity);
  }

  function numberMinted(address owner) public view returns (uint256) {
    return _numberMinted(owner);
  }

  function getOwnershipData(uint256 tokenId)
    external
    view
    returns (TokenOwnership memory)
  {
    return ownershipOf(tokenId);
  }
}