import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

// NFT Count 8888
// White list - 888,  @0.15 ETH, Max 1 Per Pax
// Public Sale - 8000, @0.2 ETH, Max 5 Per Pax
// Every 25%, 3ETH to charity wallet
// NFT Reaveal Post one week
// 40% of minting profits divided between 8800 common NFT holders 
// 5% of minting profits divided between 80 rare NFT holders 
// 5% of minting profits divided between 8 ultra-rare holders.

contract BeesNFT is ERC721Enumerable, Ownable, ReentrancyGuard {

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
    uint256 public currentPreSale;
    uint256 public storeRevealBalance; 

    uint public maxPreSale; // 1
    uint public maxPublicSale; // 5

    uint public startLegend = 1; //1
    uint public endLegend = 8; //8
    uint public startRare = 9; // 9
    uint public endRare = 88; // 88

    string private _baseURIextended;
    
    string public NETWORK_PROVENANCE = "";
    string public notRevealerUri;

    uint256 public donationAmount; // 3 ETH
    address public charityBeesAddress; // Set Address

    mapping(address => bool) isWhiteListed; 
    mapping(uint => bool) amountClaimed;

    constructor(string memory name, string memory symbol, uint256 _preSalePrice, uint256 _publicSalePrice, uint256 _maxPreSale, uint256 _maxPublicSale, uint256 _preSaleTotal, uint256 _donationAmount, address _charityBeesAddress) ERC721(name, symbol) ReentrancyGuard() {
        preSalePrice = _preSalePrice;
        publicSalePrice = _publicSalePrice;
        maxPreSale = _maxPreSale;
        maxPublicSale = _maxPublicSale;
        preSaleTotal = _preSaleTotal;
        donationAmount = _donationAmount;
        charityBeesAddress = _charityBeesAddress;
    }

    function preSaleMint(uint256 _amount) external payable nonReentrant{
        require(preSaleActive, "NFT-Bees Pre Sale is not Active");
        require(isWhiteListed[msg.sender], "NFT-Bees Message Sender is not whitelisted");
        require(currentPreSale <= preSaleTotal, "NFT-Bees Pre Sale Max Limit Reached");
        require(balanceOf(msg.sender).add(_amount) < maxPreSale, "NFT-Bees Max Pre Sale Mint Reached");
        mint(_amount, true);
    }

    function publicSaleMint(uint256 _amount) external payable nonReentrant {
        require(publicSaleActive, "NFT-Bees Public Sale is not Active");
        require(balanceOf(msg.sender).add(_amount) < maxPublicSale, "NFT-Bees Max Public Sale Mint Reached");
        mint(_amount, false);
    }

    function mint(uint256 amount,bool state) internal {
        require(!paused, "NFT-Bees Minting is Paused");
        require(totalSupply().add(amount) <= maxSupply, "NFT-Bees Max Minting Reached");
        if(state){
            require(preSalePrice*amount <= msg.value, "NFT-Bees ETH Value Sent for Pre Sale is not enough");
        }
        else{
            require(publicSalePrice*amount <= msg.value, "NFT-Bees ETH Value Sent for Public Sale is not enough");
        }
        uint mintIndex = totalSupply();
        for(uint ind = 1;ind<=amount;ind++){
            _safeMint(msg.sender, mintIndex.add(ind));
        }
    }

    function _baseURI() internal view virtual override returns (string memory){
        return _baseURIextended;
    }

    function setBaseURI(string calldata baseURI_) external onlyOwner {
        _baseURIextended = baseURI_;
    }

    function addWhiteListAddress(address[] memory _address) external onlyOwner {
        for (uint i=0; i<_address.length; i++){
            isWhiteListed[_address[i]] = true;
        }
    }

    function togglePauseState() external onlyOwner {
        paused = !paused;
    }

    function togglePreSale() external onlyOwner {
        preSaleActive = !preSaleActive;
    }

    function togglePublicSale() external onlyOwner {
        publicSaleActive = !publicSaleActive;
    }

    function setPreSalePrice(uint256 _preSalePrice) external onlyOwner {
        preSalePrice = _preSalePrice;
    }

    function setPublicSalePrice(uint256 _publicSalePrice) external onlyOwner {
        publicSalePrice = _publicSalePrice;
    }

    function setHoneyBalance() external onlyOwner {
        storeRevealBalance = address(this).balance;
    }

    function airDrop(address[] memory _address) external onlyOwner {
        require(totalSupply().add(_address.length) <= maxSupply, "NFT-Bees Maximum Supply Reached");
        for(uint i=1; i <= _address.length; i++){
            _safeMint(_address[i], totalSupply().add(i));
        }
    }

    function reveal() external onlyOwner {
        revealed = true;
        storeRevealBalance = address(this).balance;
    }

    // Need to take care of Honey Pot Withdraw (40%, 5%, 5%)
    function withdraw() external onlyOwner {
        uint balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    function isLegendary(uint _tokenId) public view returns (bool) {
        if(_tokenId <= endLegend && _tokenId >= startLegend)
        {
            return true;
        }
        return false;
    }

    function isRare(uint _tokenId) public view returns (bool) {
        if(_tokenId <= endRare && _tokenId >= startRare)
        {
            return true;
        }
        return false;
    }

    function withdrawHoneyPot(uint _tokenId) external nonReentrant {
        require(msg.sender == ownerOf(_tokenId), "NFT-Bees: You are not the owner of this token");
        require(amountClaimed[_tokenId] == false, "NFT-Bees: Honey Pot Already Claimed");
        // 5%
        if(isLegendary(_tokenId)){
            payable(msg.sender).transfer(storeRevealBalance*5/(100*8));
        }
        // 5%
        else if(isRare(_tokenId)){
            payable(msg.sender).transfer(storeRevealBalance*5/(100*80));
        }
        // 40%
        else {
            payable(msg.sender).transfer(storeRevealBalance*40/(100*8000));
        }
        amountClaimed[_tokenId] = true;
    }


    function setProvenanceHash(string memory provenanceHash) external onlyOwner {
        NETWORK_PROVENANCE = provenanceHash;
    }

    function setNotRevealedURI(string memory _notRevealedUri) external onlyOwner {
        notRevealerUri = _notRevealedUri;
    }

    function setCharityAddress(address _address) external onlyOwner {
        charityBeesAddress = _address;
    }

    // Need to make sure that the 25% transaction is not affected because of donate.
    function donate3ETH() internal {
        payable(charityBeesAddress).transfer(donationAmount);
    }
}