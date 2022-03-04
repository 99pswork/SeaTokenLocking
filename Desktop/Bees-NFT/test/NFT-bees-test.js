const { expect } = require("chai");
const { ethers } = require("hardhat");
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545"); 

describe("NFT", function () {

  before(async() =>{
    const NFT = await ethers.getContractFactory("BeesNFT");
    nft = await NFT.deploy("Honey Pot", "HONEY", "150000000000000000", "200000000000000000", 1, 5, 10, 20);
    await nft.deployed();


    accounts = await ethers.getSigners();
    
  })

    it("Should check for contract's ownership!", async function () {
        expect(await nft.owner()).to.equal(accounts[0].address);
    });

    it("Check Base URI Before Reveal", async function() {
        await expect(nft.tokenURI(0)).to.be.revertedWith("NFT-Bees URI For Token Non-existent");
    });

    it("Check Status Paused", async function () {
        expect(await nft.paused()).to.equal(true);
        await nft.togglePauseState();
        expect(await nft.paused()).to.equal(false);
        await nft.togglePauseState();
    })

    it("Check Pre Sale State", async function() {
        expect(await nft.preSaleActive()).to.equal(false);
        await nft.togglePreSale();
        expect(await nft.preSaleActive()).to.equal(true);
        await nft.togglePreSale();
    })

    it("Check Public Sale State", async function() {
        expect(await nft.publicSaleActive()).to.equal(false);
        await nft.togglePublicSale();
        expect(await nft.publicSaleActive()).to.equal(true);
        await nft.togglePublicSale();
    })

    it("Check WhiteListing of Address", async function() {
        await nft.addWhiteListAddress([accounts[1].address, accounts[2].address, accounts[3].address, accounts[4].address]);
        expect(await nft.isWhiteListed(accounts[1].address)).to.equal(true);
        expect(await nft.isWhiteListed(accounts[2].address)).to.equal(true);
        expect(await nft.isWhiteListed(accounts[3].address)).to.equal(true);
        expect(await nft.isWhiteListed(accounts[4].address)).to.equal(true);
        expect(await nft.isWhiteListed(accounts[5].address)).to.equal(false);
        expect(await nft.isWhiteListed(accounts[6].address)).to.equal(false);
        expect(await nft.isWhiteListed(accounts[0].address)).to.equal(false);
    })

    it("Check Pre Sale Mint", async function() {
        await expect(nft.connect(accounts[1])
        .preSaleMint(1, {value: ethers.utils.parseEther("0.15")}))
        .to.be.revertedWith("NFT-Bees Pre Sale is not Active");

        await nft.togglePreSale();

        await expect(nft.connect(accounts[5])
        .preSaleMint(1, {value: ethers.utils.parseEther("0.15")}))
        .to.be.revertedWith("NFT-Bees Message Sender is not whitelisted");

        await expect(nft.connect(accounts[1])
        .preSaleMint(1, {value: ethers.utils.parseEther("0.15")}))
        .to.be.revertedWith("NFT-Bees Minting is Paused");

        await nft.togglePauseState();

        await nft.connect(accounts[1]).preSaleMint(1, {value: ethers.utils.parseEther("0.15")});

        await expect(nft.connect(accounts[1])
        .preSaleMint(1, {value: ethers.utils.parseEther("0.15")}))
        .to.be.revertedWith("NFT-Bees Max Pre Sale Mint Reached");

        await expect(nft.connect(accounts[2])
        .preSaleMint(1, {value: ethers.utils.parseEther("0.10")}))
        .to.be.revertedWith("NFT-Bees ETH Value Sent for Pre Sale is not enough");

        await nft.connect(accounts[2]).preSaleMint(1, {value: ethers.utils.parseEther("0.25")});

        await expect(nft.connect(accounts[3])
        .preSaleMint(9, {value: ethers.utils.parseEther("1.35")}))
        .to.be.revertedWith("NFT-Bees Max Pre Sale Mint Reached");

    })

    it('Check Public Sale Mint', async function() {
        await expect(nft.connect(accounts[1])
        .publicSaleMint(1, {value: ethers.utils.parseEther("0.15")}))
        .to.be.revertedWith("NFT-Bees Public Sale is not Active");

        await nft.togglePublicSale();

        await nft.connect(accounts[1]).publicSaleMint(1, {value: ethers.utils.parseEther("0.2")});

        await nft.connect(accounts[5]).publicSaleMint(1, {value: ethers.utils.parseEther("0.2")});

        expect(await nft.balanceOf(accounts[5].address)).to.equal(1);

        await nft.connect(accounts[5]).publicSaleMint(4, {value: ethers.utils.parseEther("0.8")});

        await expect(nft.connect(accounts[5])
        .publicSaleMint(1, {value: ethers.utils.parseEther("0.2")}))
        .to.be.revertedWith("NFT-Bees Max Public Sale Mint Reached");

        expect(await nft.totalSupply()).to.equal(8);

        expect(await nft.tokenURI(1)).to.equal("");

        await nft.setNotRevealedURI("test.png");

        expect(await nft.tokenURI(1)).to.equal("test.png");
        expect(await nft.tokenURI(await nft.totalSupply())).to.equal("test.png");
    })

    // it('Check Token Rarity', async function() {
    //     expect(await nft.isRare(1)).to.equal(false);
    //     expect(await nft.isRare(8)).to.equal(false);
    //     expect(await nft.isRare(89)).to.equal(false);
    //     expect(await nft.isRare(9)).to.equal(true);
    //     expect(await nft.isRare(88)).to.equal(true);

    //     expect(await nft.isLegendary(1)).to.equal(true);
    //     expect(await nft.isLegendary(8)).to.equal(true);
    //     expect(await nft.isLegendary(9)).to.equal(false);
    //     expect(await nft.isLegendary(0)).to.equal(false);
    // })

    it('Try Honey Pot Withdraw', async function() {
        balance1 = await web3.eth.getBalance(accounts[1].address);

        await expect(nft.connect(accounts[1]).withdrawHoneyPot(1))
        .to.be.revertedWith("NFT-Bees: Withdraw Honey Pot Not Allowed Yet!");

        await nft.reveal();

        await nft.checkHoneyPot(1,accounts[1].address);

        await expect(nft.connect(accounts[1]).withdrawHoneyPot(2))
        .to.be.revertedWith("NFT-Bees: You are not the owner of this token");
        
        await nft.connect(accounts[1]).withdrawHoneyPot(1);

        await expect(nft.connect(accounts[1]).withdrawHoneyPot(1))
        .to.be.revertedWith("NFT-Bees: Honey Pot Already Claimed");

        await expect(nft.connect(accounts[1]).withdrawHoneyPot(3));
    })

    it('Set Base URI', async function() {
        
        expect(await nft.tokenURI(1)).to.equal("");

        await nft.setBaseURI("https://setBaseURI/");
        expect(await nft.tokenURI(8)).to.equal("https://setBaseURI/8.json");

        await expect(nft.tokenURI(9)).to.be.revertedWith("NFT-Bees URI For Token Non-existent");

    })

    it('Check Air Drop Functionality', async function() {
        
        await nft.airDrop([accounts[2].address, accounts[3].address]);
        
        balanceAcc1 = await nft.balanceOf(accounts[2].address);
        await nft.airDrop([accounts[2].address, accounts[2].address]);
        expect(await nft.balanceOf(accounts[2].address)).to.equal(parseInt(balanceAcc1)+2);

    })

    it('Check donation functionality', async function() {
        await expect(nft.donateETH()).to.be.revertedWith("NFT-Bees Address cannot be zero");

        await nft.setCharityAddress(accounts[8].address);
        await expect(nft.donateETH()).to.be.revertedWith("NFT-Bees Donation Amount cannot be zero");

        await nft.setDonationAmount("1000000000000000000");
        await nft.donateETH();
    })

    it('Check Random Number Generator', async function() {
        randNumber = await nft.raffleNumberGenerator(8888);
        expect(parseInt(randNumber)).to.be.lessThan(8889);
        randNumber2 = await nft.raffleNumberGenerator(20);
        expect(parseInt(randNumber2)).to.be.lessThan(21);
        randNumber3 = await nft.raffleNumberGenerator(200);
        expect(parseInt(randNumber3)).to.be.lessThan(201);
    })

    it('Check Raffle Reward', async function() {
        console.log(await web3.eth.getBalance(nft.address));
        await nft.sendRaffleReward(accounts[2].address);
        console.log(await web3.eth.getBalance(nft.address));
    })

    it('Withdraw money to owner Account', async function() {
        bal1 = await web3.eth.getBalance(accounts[0].address);
        await expect(nft.connect(accounts[1])
        .withdrawTotal())
        .to.be.revertedWith("Ownable: caller is not the owner");

        await nft.withdrawTotal();

        contractBal = await web3.eth.getBalance(nft.address);
        expect(contractBal).to.equal(ethers.utils.parseEther("0.0"));
    })
    
});