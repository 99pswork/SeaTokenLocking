const { expect } = require("chai");
const { ethers } = require("hardhat");
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545"); 

describe("NFT", function () {

  before(async() =>{
    const NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy("Funky Salamanders", "FUNKY SALAMANDERS", 15, 5, 2, 4, "50000000000000000", "50000000000000000",100);
    await nft.deployed();


    accounts = await ethers.getSigners();
    
  })

    it("Should check for contract's ownership!", async function () {
        expect(await nft.owner()).to.equal(accounts[0].address);
    });
});