// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title FhenixOGNFT
 * @dev Simple NFT contract for testing (FHE disabled for gas optimization)
 * 
 * Features:
 * - Standard ERC721 with IPFS metadata
 * - Low gas fees for testing
 * - FHE integration ready (commented out)
 */
contract FhenixOGNFT is ERC721, ERC721URIStorage, Ownable {
    // ============ State Variables ============
    
    uint256 private _tokenIdCounter;
    
    // Max supply (public)
    uint256 public constant MAX_SUPPLY = 10000;
    
    // Mint price (public)
    uint256 public constant MINT_PRICE = 0.001 ether;
    
    // Base URI for token metadata
    string private _baseTokenURI;
    
    // Public rarity scores (for testing - will be encrypted in production)
    mapping(uint256 => uint256) public rarityScores;
    
    // Public attributes (for testing - will be encrypted in production)
    mapping(uint256 => uint256) public attributes;

    // ============ Events ============
    
    event NFTMinted(
        address indexed minter,
        uint256 indexed tokenId,
        string tokenURI,
        uint256 rarity
    );

    // ============ Constructor ============
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        _tokenIdCounter = 0;
    }

    // ============ Minting Functions ============
    
    /**
     * @dev Simple mint function with public data (low gas)
     * @param rarity Rarity score (1-100)
     * @param attribute Special attribute value
     */
    function mint(
        uint256 rarity,
        uint256 attribute
    ) external payable returns (uint256) {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(rarity >= 1 && rarity <= 100, "Invalid rarity");
        
        uint256 currentSupply = _tokenIdCounter;
        require(currentSupply < MAX_SUPPLY, "Max supply reached");
        
        // Get token ID
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Store public data (will be encrypted in production version)
        rarityScores[tokenId] = rarity;
        attributes[tokenId] = attribute;
        
        // Mint the NFT
        _safeMint(msg.sender, tokenId);
        
        // Set token URI
        string memory uri = string(
            abi.encodePacked(_baseTokenURI, Strings.toString(tokenId), ".json")
        );
        _setTokenURI(tokenId, uri);
        
        emit NFTMinted(msg.sender, tokenId, uri, rarity);
        
        return tokenId;
    }

    // ============ View Functions ============
    
    /**
     * @dev Get current supply
     * @return Current supply
     */
    function getCurrentSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Get rarity for a token
     * @param tokenId The token ID
     * @return Rarity score
     */
    function getRarity(uint256 tokenId) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return rarityScores[tokenId];
    }
    
    /**
     * @dev Get attribute for a token
     * @param tokenId The token ID
     * @return Attribute value
     */
    function getAttribute(uint256 tokenId) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return attributes[tokenId];
    }
    
    /**
     * @dev Base URI for computing tokenURI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // ============ Admin Functions ============
    
    /**
     * @dev Set base URI for token metadata
     * @param baseURI The new base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }

    // ============ Required Overrides ============
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
