// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// Fhenix CoFHE Imports - Real FHE Integration
import { FHE, euint32, euint64, ebool } from "../vendor/cofhe-contracts/contracts/FHE.sol";
import { InEuint32, InEbool } from "../vendor/cofhe-contracts/contracts/ICofhe.sol";
import { PermissionedV2, Permission } from "./PermissionedV2.sol";

/**
 * @title FhenixOGNFT
 * @dev Privacy-preserving NFT contract using Fhenix CoFHE with real FHE operations
 * 
 * Features:
 * - Encrypted rarity scores per NFT using euint32
 * - Encrypted total supply counter using euint32
 * - Private mint tracking using euint32
 * - Permit-based metadata decryption with FHE.allow()
 * - Real FHE arithmetic operations (FHE.add, FHE.asEuint32)
 */
contract FhenixOGNFT is ERC721, ERC721URIStorage, Ownable, PermissionedV2 {
    // ============ State Variables ============
    
    uint256 private _tokenIdCounter;
    
    // Encrypted total supply - hidden from public view using real FHE
    euint32 private _encryptedTotalSupply;
    
    // Max supply (public)
    uint256 public constant MAX_SUPPLY = 10000;
    
    // Mint price (public)
    uint256 public constant MINT_PRICE = 0.001 ether;
    
    // Base URI for optional metadata prefix
    string private _baseTokenURI;
    
    // Mapping: tokenId => encrypted rarity score (real FHE type)
    mapping(uint256 => euint32) private _encryptedRarity;
    
    // Mapping: tokenId => encrypted special attribute (real FHE type)
    mapping(uint256 => euint32) private _encryptedAttribute;
    
    // Mapping: address => encrypted mint count per user (real FHE type)
    mapping(address => euint32) private _userEncryptedMintCount;
    
    // Mapping: tokenId => encrypted timestamp (real FHE type)
    mapping(uint256 => euint64) private _encryptedMintTimestamp;
    
    // Whitelist: address => encrypted whitelist status (real FHE type)
    mapping(address => ebool) private _encryptedWhitelist;

    // Decryption handles (per token)
    mapping(uint256 => euint32) private _lastDecryptedRarity;
    mapping(uint256 => euint32) private _lastDecryptedAttribute;

    // ============ Events ============
    
    event DebugLog(string message);
    event DebugLogUint256(uint256 value);
    
    event NFTMinted(
        address indexed minter,
        uint256 indexed tokenId,
        string tokenURI
    );
    
    event RaritySet(
        uint256 indexed tokenId,
        bytes32 encryptedRarityHash
    );
    
    event WhitelistUpdated(
        address indexed user,
        bytes32 encryptedStatusHash
    );

    // ============ Constructor ============
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(msg.sender) PermissionedV2() {
        _baseTokenURI = baseURI;
        _tokenIdCounter = 0;
        // Initialize encrypted total supply to 0 using real FHE
        _encryptedTotalSupply = FHE.asEuint32(0);
    }

    // ============ Minting Functions ============
    
    /**
     * @dev Public mint function with gas tracking to identify expensive operations
     * @param encryptedRarity Encrypted rarity score (1-100) as InEuint32
     * @param encryptedAttribute Encrypted special attribute value as InEuint32
     * @param tokenUri Full token URI (ipfs://... or https://...)
     */
    function mint(
        InEuint32 calldata encryptedRarity,
        InEuint32 calldata encryptedAttribute,
        string calldata tokenUri
    ) external payable returns (uint256) {
        uint256 gasStart = gasleft();
        emit DebugLog("MINT: Starting gas analysis");
        
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        uint256 gasAfterChecks = gasleft();
        emit DebugLog("MINT: After checks - gas used:");
        emit DebugLogUint256(gasStart - gasAfterChecks);
        
        uint256 currentSupply = _tokenIdCounter;
        require(currentSupply < MAX_SUPPLY, "Max supply reached");
        
        // Get token ID
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        uint256 gasBeforeFHE = gasleft();
        emit DebugLog("MINT: Before FHE operations - gas remaining:");
        emit DebugLogUint256(gasBeforeFHE);
        
        // Store encrypted rarity and attribute (minimal FHE operations)
        _encryptedRarity[tokenId] = FHE.asEuint32(encryptedRarity);
        uint256 gasAfterRarity = gasleft();
        emit DebugLog("MINT: After FHE.asEuint32(rarity) - gas used:");
        emit DebugLogUint256(gasBeforeFHE - gasAfterRarity);
        
        _encryptedAttribute[tokenId] = FHE.asEuint32(encryptedAttribute);
        uint256 gasAfterAttribute = gasleft();
        emit DebugLog("MINT: After FHE.asEuint32(attribute) - gas used:");
        emit DebugLogUint256(gasAfterRarity - gasAfterAttribute);
        
        // Update encrypted total supply
        _encryptedTotalSupply = FHE.add(
            _encryptedTotalSupply,
            FHE.asEuint32(1)
        );

        // Store encrypted mint timestamp
        _encryptedMintTimestamp[tokenId] = FHE.asEuint64(uint64(block.timestamp));

        // Update user's encrypted mint count
        _userEncryptedMintCount[msg.sender] = FHE.add(
            _userEncryptedMintCount[msg.sender],
            FHE.asEuint32(1)
        );

        // Mint the NFT first (standard ERC721 operation)
        uint256 gasBeforeMint = gasleft();
        _safeMint(msg.sender, tokenId);
        uint256 gasAfterMint = gasleft();
        emit DebugLog("MINT: _safeMint - gas used:");
        emit DebugLogUint256(gasBeforeMint - gasAfterMint);
        
        // Set token URI (non-sensitive metadata on IPFS)
        uint256 gasBeforeURI = gasleft();
        require(bytes(tokenUri).length > 0, "Token URI required");
        _setTokenURI(tokenId, tokenUri);
        uint256 gasAfterURI = gasleft();
        emit DebugLog("MINT: Token URI setup - gas used:");
        emit DebugLogUint256(gasBeforeURI - gasAfterURI);
        
        // Grant permissions (batch operations to save gas)
        uint256 gasBeforePerms = gasleft();
        FHE.allowThis(_encryptedRarity[tokenId]);
        FHE.allowThis(_encryptedAttribute[tokenId]);
        FHE.allowThis(_encryptedTotalSupply);
        FHE.allowThis(_encryptedMintTimestamp[tokenId]);
        FHE.allowThis(_userEncryptedMintCount[msg.sender]);
        FHE.allow(_encryptedRarity[tokenId], msg.sender);
        FHE.allow(_encryptedAttribute[tokenId], msg.sender);
        FHE.allow(_encryptedTotalSupply, msg.sender);
        FHE.allow(_encryptedMintTimestamp[tokenId], msg.sender);
        FHE.allow(_userEncryptedMintCount[msg.sender], msg.sender);
        uint256 gasAfterPerms = gasleft();
        emit DebugLog("MINT: FHE permissions - gas used:");
        emit DebugLogUint256(gasBeforePerms - gasAfterPerms);
        
        uint256 totalGasUsed = gasStart - gasAfterPerms;
        emit DebugLog("MINT: TOTAL GAS USED:");
        emit DebugLogUint256(totalGasUsed);
        
        emit NFTMinted(msg.sender, tokenId, tokenUri);
        emit RaritySet(tokenId, keccak256(abi.encode(_encryptedRarity[tokenId])));
        
        return tokenId;
    }

    // ============ Encrypted Data Getters ============
    
    /**
     * @dev Get encrypted rarity for a token (returns real euint32)
     * @param tokenId The token ID
     * @return The encrypted rarity value as euint32
     */
    function getEncryptedRarity(uint256 tokenId) 
        external 
        view 
        returns (euint32) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _encryptedRarity[tokenId];
    }
    
    /**
     * @dev Get encrypted attribute for a token (returns real euint32)
     * @param tokenId The token ID
     * @return The encrypted attribute value as euint32
     */
    function getEncryptedAttribute(uint256 tokenId) 
        external 
        view 
        returns (euint32) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _encryptedAttribute[tokenId];
    }
    
    /**
     * @dev Get encrypted total supply (returns real euint32)
     * @return The encrypted total supply as euint32
     */
    function getEncryptedTotalSupply() 
        external 
        view 
        returns (euint32) 
    {
        return _encryptedTotalSupply;
    }
    
    /**
     * @dev Get user's encrypted mint count (returns real euint32)
     * @param user The user address
     * @return The encrypted mint count as euint32
     */
    function getUserEncryptedMintCount(address user) 
        external 
        view 
        returns (euint32) 
    {
        return _userEncryptedMintCount[user];
    }
    
    /**
     * @dev Get encrypted mint timestamp for a token (returns real euint64)
     * @param tokenId The token ID
     * @return The encrypted timestamp as euint64
     */
    function getEncryptedMintTimestamp(uint256 tokenId) 
        external 
        view 
        returns (euint64) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _encryptedMintTimestamp[tokenId];
    }

    // ============ Permit-Based Decryption (PermissionedV2) ============

    function requestDecryptRarityWithPermission(uint256 tokenId, Permission calldata permission)
        external
        withPermission(permission)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(permission.issuer == _ownerOf(tokenId), "Issuer must be token owner");
        _lastDecryptedRarity[tokenId] = _encryptedRarity[tokenId];
        FHE.decrypt(_lastDecryptedRarity[tokenId]);
    }

    function requestDecryptAttributeWithPermission(uint256 tokenId, Permission calldata permission)
        external
        withPermission(permission)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(permission.issuer == _ownerOf(tokenId), "Issuer must be token owner");
        _lastDecryptedAttribute[tokenId] = _encryptedAttribute[tokenId];
        FHE.decrypt(_lastDecryptedAttribute[tokenId]);
    }

    function getDecryptedRarityWithPermission(uint256 tokenId, Permission calldata permission)
        external
        view
        withPermission(permission)
        returns (uint32 value, bool decrypted)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(permission.issuer == _ownerOf(tokenId), "Issuer must be token owner");
        return FHE.getDecryptResultSafe(_lastDecryptedRarity[tokenId]);
    }

    function getDecryptedAttributeWithPermission(uint256 tokenId, Permission calldata permission)
        external
        view
        withPermission(permission)
        returns (uint32 value, bool decrypted)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(permission.issuer == _ownerOf(tokenId), "Issuer must be token owner");
        return FHE.getDecryptResultSafe(_lastDecryptedAttribute[tokenId]);
    }

    // ============ Decryption Flow ============

    /**
     * @dev Request async decryption for both rarity and attribute (owner only)
     */
    function requestDecryptAll(uint256 tokenId) external {
        require(_ownerOf(tokenId) == msg.sender, "Only owner can decrypt");
        _lastDecryptedRarity[tokenId] = _encryptedRarity[tokenId];
        _lastDecryptedAttribute[tokenId] = _encryptedAttribute[tokenId];
        FHE.decrypt(_lastDecryptedRarity[tokenId]);
        FHE.decrypt(_lastDecryptedAttribute[tokenId]);
    }

    /**
     * @dev Request async decryption for both rarity and attribute with permission
     */
    function requestDecryptAllWithPermission(uint256 tokenId, Permission calldata permission)
        external
        withPermission(permission)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(permission.issuer == _ownerOf(tokenId), "Issuer must be token owner");
        _lastDecryptedRarity[tokenId] = _encryptedRarity[tokenId];
        _lastDecryptedAttribute[tokenId] = _encryptedAttribute[tokenId];
        FHE.decrypt(_lastDecryptedRarity[tokenId]);
        FHE.decrypt(_lastDecryptedAttribute[tokenId]);
    }

    /**
     * @dev Request async decryption for rarity (owner only)
     */
    function requestDecryptRarity(uint256 tokenId) external {
        require(_ownerOf(tokenId) == msg.sender, "Only owner can decrypt");
        _lastDecryptedRarity[tokenId] = _encryptedRarity[tokenId];
        FHE.decrypt(_lastDecryptedRarity[tokenId]);
    }

    /**
     * @dev Request async decryption for attribute (owner only)
     */
    function requestDecryptAttribute(uint256 tokenId) external {
        require(_ownerOf(tokenId) == msg.sender, "Only owner can decrypt");
        _lastDecryptedAttribute[tokenId] = _encryptedAttribute[tokenId];
        FHE.decrypt(_lastDecryptedAttribute[tokenId]);
    }

    /**
     * @dev Get decrypted rarity value (returns value + readiness)
     */
    function getDecryptedRarity(uint256 tokenId)
        external
        view
        returns (uint32 value, bool decrypted)
    {
        require(_ownerOf(tokenId) == msg.sender, "Only owner can decrypt");
        return FHE.getDecryptResultSafe(_lastDecryptedRarity[tokenId]);
    }

    /**
     * @dev Get decrypted attribute value (returns value + readiness)
     */
    function getDecryptedAttribute(uint256 tokenId)
        external
        view
        returns (uint32 value, bool decrypted)
    {
        require(_ownerOf(tokenId) == msg.sender, "Only owner can decrypt");
        return FHE.getDecryptResultSafe(_lastDecryptedAttribute[tokenId]);
    }

    // ============ Admin Functions ============
    
    /**
     * @dev Update whitelist status for a user using real FHE
     * @param user The user address
     * @param encryptedStatus Encrypted whitelist status as InEbool
     */
    function updateWhitelist(
        address user,
        InEbool calldata encryptedStatus
    ) external onlyOwner {
        _encryptedWhitelist[user] = FHE.asEbool(encryptedStatus);
        FHE.allowThis(_encryptedWhitelist[user]);
        FHE.allow(_encryptedWhitelist[user], user);
        
        emit WhitelistUpdated(user, keccak256(abi.encode(_encryptedWhitelist[user])));
    }
    
    /**
     * @dev Check if user is whitelisted (returns real ebool)
     * @param user The user address
     * @return Encrypted whitelist status as ebool
     */
    function isWhitelisted(address user) 
        external 
        view 
        returns (ebool) 
    {
        return _encryptedWhitelist[user];
    }
    
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

    // ============ View Functions ============
    
    /**
     * @dev Get current public supply (non-encrypted counter)
     * @return Current supply
     */
    function getCurrentSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Base URI for computing tokenURI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
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
