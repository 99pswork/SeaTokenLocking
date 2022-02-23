import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

pragma solidity ^0.8.4;

// NFT Count 8888
// White list - 888,  @0.15 ETH, Max 1 Per Pax
// Public Sale - 8000, @0.2 ETH, Max 5 Per Pax
// Every 25%, 3ETH to charity wallet
// NFT Reaveal Post one week
// 40% of minting profits divided between 8800 common NFT holders 
// 5% of minting profits divided between 80 rare NFT holders 
// 5% of minting profits divided between 8 ultra-rare holders.

contract BeesNFT is ERC721, Ownable, ReentrancyGuard {

    using SafeMath for uint256;
    using Strings for uint256;

    bool public preSaleActive = false;
    bool public publicSaleActive = false;

    bool public paused;
    bool public revealed;

    uint256 public maxSupply; // 8888
    uint256 public preSalePrice; // 0.15ETH
    uint256 public publicSalePrice; // 0.2ETH
    uint256 public preSaleTotal; // 880 

    uint public maxPreSale;
    uint public maxPublicSale;

    mapping(address => bool) isWhiteListed; 

    constructor(string memory name, string memory symbol, uint256 _preSalePrice, uint256 _publicSalePrice, uint256 _maxPreSale, uint256 _maxPublicSale, uint256 _preSaleTotal) ERC721(name, symbol) ReentrancyGuard() {
        preSalePrice = _preSalePrice;
        publicSalePrice = _publicSalePrice;
        maxPreSale = _maxPreSale;
        maxPublicSale = _maxPublicSale;
        preSaleTotal = _preSaleTotal;
    }


}