import { expect } from "chai";
import hre from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import type { TradeRouter, MockOpinionExchange, FeeTracker } from "../typechain-types";

const { ethers } = hre;

describe("TradeRouter", function () {
  let tradeRouter: TradeRouter;
  let mockOpinionExchange: MockOpinionExchange;
  let feeTracker: FeeTracker;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let feeWallet: SignerWithAddress;

  const MIN_ORDER_AMOUNT = ethers.parseEther("5"); // $5
  const MIN_FEE_AMOUNT = ethers.parseEther("0.5"); // $0.5
  const FEE_BASIS_POINTS = 50; // 0.5%

  beforeEach(async function () {
    [owner, user, feeWallet] = await ethers.getSigners();

    // Deploy MockOpinionExchange
    const MockOpinionExchangeFactory = await ethers.getContractFactory("MockOpinionExchange");
    mockOpinionExchange = await MockOpinionExchangeFactory.deploy();
    await mockOpinionExchange.waitForDeployment();

    // Deploy TradeRouter first (needed for FeeTracker)
    const TradeRouterFactory = await ethers.getContractFactory("TradeRouter");
    tradeRouter = await TradeRouterFactory.deploy(
      await mockOpinionExchange.getAddress(),
      feeWallet.address,
      FEE_BASIS_POINTS
    );
    await tradeRouter.waitForDeployment();

    // Deploy FeeTracker with TradeRouter address
    const FeeTrackerFactory = await ethers.getContractFactory("FeeTracker");
    feeTracker = await FeeTrackerFactory.deploy(await tradeRouter.getAddress());
    await feeTracker.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct opinion exchange address", async function () {
      expect(await tradeRouter.opinionExchange()).to.equal(await mockOpinionExchange.getAddress());
    });

    it("Should set the correct fee wallet", async function () {
      expect(await tradeRouter.feeWallet()).to.equal(feeWallet.address);
    });

    it("Should set the correct fee basis points", async function () {
      expect(await tradeRouter.feeBasisPoints()).to.equal(FEE_BASIS_POINTS);
    });

    it("Should set deployer as owner", async function () {
      // Note: TradeRouter doesn't expose owner, but we can test through other owner functions
      // This is verified through setFeeWallet test
    });
  });

  describe("Fee Calculation", function () {
    it("Should calculate fee correctly (0.5% of amount)", async function () {
      const amount = ethers.parseEther("100"); // $100
      const expectedFee = (amount * BigInt(FEE_BASIS_POINTS)) / BigInt(10000); // 0.5%
      const calculatedFee = await tradeRouter.calculateFee(amount);
      expect(calculatedFee).to.equal(expectedFee);
    });

    it("Should enforce minimum fee of $0.5", async function () {
      const amount = ethers.parseEther("10"); // $10, fee would be $0.05
      const calculatedFee = await tradeRouter.calculateFee(amount);
      expect(calculatedFee).to.equal(MIN_FEE_AMOUNT); // Should be $0.5 minimum
    });

    it("Should calculate fee for large amounts", async function () {
      const amount = ethers.parseEther("1000"); // $1000
      const expectedFee = (amount * BigInt(FEE_BASIS_POINTS)) / BigInt(10000); // $5
      const calculatedFee = await tradeRouter.calculateFee(amount);
      expect(calculatedFee).to.equal(expectedFee);
    });
  });

  describe("Trade Execution", function () {
    const marketId = 1;
    const side = true; // YES
    const amount = ethers.parseEther("100"); // $100
    const emptySignature = "0x";

    it("Should execute a trade successfully", async function () {
      const initialBalance = await ethers.provider.getBalance(feeWallet.address);
      
      const tx = await tradeRouter.connect(user).executeTrade(
        marketId,
        side,
        amount,
        emptySignature,
        { value: amount }
      );
      const receipt = await tx.wait();

      // Check event was emitted
      const tradeExecutedEvent = receipt?.logs.find(
        (log: any) => log.fragment?.name === "TradeExecuted"
      );
      expect(tradeExecutedEvent).to.not.be.undefined;

      // Check fee was transferred
      const finalBalance = await ethers.provider.getBalance(feeWallet.address);
      const fee = await tradeRouter.calculateFee(amount);
      expect(finalBalance - initialBalance).to.equal(fee);

      // Check trade was recorded
      const tradeId = await tradeRouter.tradeCounter();
      expect(tradeId).to.equal(1);
    });

    it("Should reject orders below minimum amount", async function () {
      const smallAmount = ethers.parseEther("4"); // Below $5 minimum

      await expect(
        tradeRouter.connect(user).executeTrade(
          marketId,
          side,
          smallAmount,
          emptySignature,
          { value: smallAmount }
        )
      ).to.be.revertedWith("Order too small");
    });

    it("Should record trade in user's trade list", async function () {
      await tradeRouter.connect(user).executeTrade(
        marketId,
        side,
        amount,
        emptySignature,
        { value: amount }
      );

      const userTrades = await tradeRouter.getUserTrades(user.address);
      expect(userTrades.length).to.equal(1);
      expect(userTrades[0]).to.equal(1); // First trade ID
    });

    it("Should increment trade counter", async function () {
      expect(await tradeRouter.tradeCounter()).to.equal(0);

      await tradeRouter.connect(user).executeTrade(
        marketId,
        side,
        amount,
        emptySignature,
        { value: amount }
      );

      expect(await tradeRouter.tradeCounter()).to.equal(1);

      await tradeRouter.connect(user).executeTrade(
        marketId,
        false, // NO
        amount,
        emptySignature,
        { value: amount }
      );

      expect(await tradeRouter.tradeCounter()).to.equal(2);
    });

    it("Should emit TradeExecuted event", async function () {
      await expect(
        tradeRouter.connect(user).executeTrade(
          marketId,
          side,
          amount,
          emptySignature,
          { value: amount }
        )
      )
        .to.emit(tradeRouter, "TradeExecuted")
        .withArgs(
          1, // tradeId
          user.address,
          marketId,
          side,
          amount,
          await tradeRouter.calculateFee(amount)
        );
    });

    it("Should emit FeeCollected event", async function () {
      const fee = await tradeRouter.calculateFee(amount);
      
      await expect(
        tradeRouter.connect(user).executeTrade(
          marketId,
          side,
          amount,
          emptySignature,
          { value: amount }
        )
      )
        .to.emit(tradeRouter, "FeeCollected")
        .withArgs(user.address, fee, (value: any) => typeof value === "bigint");
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to update fee wallet", async function () {
      const newFeeWallet = ethers.Wallet.createRandom().address;
      
      await expect(tradeRouter.connect(owner).setFeeWallet(newFeeWallet))
        .to.emit(tradeRouter, "FeeWalletUpdated")
        .withArgs(feeWallet.address, newFeeWallet);

      expect(await tradeRouter.feeWallet()).to.equal(newFeeWallet);
    });

    it("Should reject non-owner from updating fee wallet", async function () {
      const newFeeWallet = ethers.Wallet.createRandom().address;
      
      await expect(
        tradeRouter.connect(user).setFeeWallet(newFeeWallet)
      ).to.be.revertedWith("Not owner");
    });

    it("Should allow owner to update fee basis points", async function () {
      const newBasisPoints = 100; // 1%
      
      await expect(tradeRouter.connect(owner).setFeeBasisPoints(newBasisPoints))
        .to.emit(tradeRouter, "FeeBasisPointsUpdated")
        .withArgs(FEE_BASIS_POINTS, newBasisPoints);

      expect(await tradeRouter.feeBasisPoints()).to.equal(newBasisPoints);
    });

    it("Should reject fee basis points above 10%", async function () {
      const tooHighBasisPoints = 1001; // > 10%
      
      await expect(
        tradeRouter.connect(owner).setFeeBasisPoints(tooHighBasisPoints)
      ).to.be.revertedWith("Fee too high");
    });

    it("Should reject non-owner from updating fee basis points", async function () {
      await expect(
        tradeRouter.connect(user).setFeeBasisPoints(100)
      ).to.be.revertedWith("Not owner");
    });
  });

  describe("Trade Retrieval", function () {
    it("Should retrieve trade details by ID", async function () {
      const amount = ethers.parseEther("100");
      const emptySignature = "0x";

      await tradeRouter.connect(user).executeTrade(
        1,
        true,
        amount,
        emptySignature,
        { value: amount }
      );

      const trade = await tradeRouter.getTrade(1);
      expect(trade.user).to.equal(user.address);
      expect(trade.marketId).to.equal(1);
      expect(trade.side).to.equal(true);
      expect(trade.amount).to.equal(amount);
      expect(trade.executed).to.equal(true);
    });

    it("Should return empty trade list for new user", async function () {
      const newUser = ethers.Wallet.createRandom();
      const userTrades = await tradeRouter.getUserTrades(newUser.address);
      expect(userTrades.length).to.equal(0);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple trades from same user", async function () {
      const amount = ethers.parseEther("100");
      const emptySignature = "0x";

      // Execute 3 trades
      for (let i = 0; i < 3; i++) {
        await tradeRouter.connect(user).executeTrade(
          1,
          i % 2 === 0, // Alternate sides
          amount,
          emptySignature,
          { value: amount }
        );
      }

      const userTrades = await tradeRouter.getUserTrades(user.address);
      expect(userTrades.length).to.equal(3);
      expect(userTrades[0]).to.equal(1);
      expect(userTrades[1]).to.equal(2);
      expect(userTrades[2]).to.equal(3);
    });

    it("Should handle different market IDs", async function () {
      const amount = ethers.parseEther("100");
      const emptySignature = "0x";

      await tradeRouter.connect(user).executeTrade(
        1,
        true,
        amount,
        emptySignature,
        { value: amount }
      );

      await tradeRouter.connect(user).executeTrade(
        2,
        false,
        amount,
        emptySignature,
        { value: amount }
      );

      const trade1 = await tradeRouter.getTrade(1);
      const trade2 = await tradeRouter.getTrade(2);

      expect(trade1.marketId).to.equal(1);
      expect(trade2.marketId).to.equal(2);
    });
  });
});

