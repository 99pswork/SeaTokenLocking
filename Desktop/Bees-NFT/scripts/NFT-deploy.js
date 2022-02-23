const fs = require('fs');
const { web3, ethers } = require('hardhat');
const CONFIG = require("../scripts/credentials.json");
// const nftABI = (JSON.parse(fs.readFileSync('./artifacts/contracts/NFT.sol/NFT.json', 'utf8'))).abi;

contract("NFT deployment", () => {
    let nft;
    let tx;

    const provider = new ethers.providers.JsonRpcProvider(CONFIG["RINKEBY"]["URL"]);
    const signer = new ethers.Wallet(CONFIG["RINKEBY"]["PKEY"]);
    const account = signer.connect(provider);

    before(async () => {
      const NFT = await ethers.getContractFactory("NFT");
      nft = await NFT.deploy();
      await nft.deployed();

      console.log("NFT deployed at address: ",nft.address);

    })

    // after(async () => {
    //     console.log('\u0007');
    //     console.log('\u0007');
    //     console.log('\u0007');
    //     console.log('\u0007');
    // })

    it ("should print contract address", async () => {
      console.log("NFT deployed at address: ",nft.address);
      
    });

    it("Should check for contract's ownership!", async function () {
      console.log(await nft.owner());
      expect(await nft.owner()).to.equal("");
    });
})