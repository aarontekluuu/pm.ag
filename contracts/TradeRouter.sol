// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IOpinionExchange.sol";

/**
 * @title TradeRouter
 * @notice Routes trades to Opinion.trade contracts and collects fees
 * @dev This contract acts as a proxy/router for Opinion.trade trades
 */
contract TradeRouter {
    address public immutable opinionExchange;
    address public feeWallet;
    uint256 public feeBasisPoints; // e.g., 50 = 0.5%
    uint256 public tradeCounter;
    address public owner;
    
    uint256 public constant MIN_ORDER_AMOUNT = 5e18; // $5 minimum (assuming 18 decimals)
    uint256 public constant MIN_FEE_AMOUNT = 5e17; // $0.5 minimum fee
    
    struct Trade {
        address user;
        uint256 marketId;
        bool side; // true = YES, false = NO
        uint256 amount;
        uint256 fee;
        uint256 timestamp;
        bool executed;
    }
    
    mapping(address => uint256[]) public userTrades;
    mapping(uint256 => Trade) public trades;
    
    event TradeExecuted(
        uint256 indexed tradeId,
        address indexed user,
        uint256 marketId,
        bool side,
        uint256 amount,
        uint256 fee
    );
    
    event FeeCollected(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    event FeeWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event FeeBasisPointsUpdated(uint256 oldBasisPoints, uint256 newBasisPoints);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor(
        address _opinionExchange,
        address _feeWallet,
        uint256 _feeBasisPoints
    ) {
        require(_opinionExchange != address(0), "Invalid exchange address");
        require(_feeWallet != address(0), "Invalid fee wallet");
        require(_feeBasisPoints <= 1000, "Fee too high"); // Max 10%
        
        opinionExchange = _opinionExchange;
        feeWallet = _feeWallet;
        feeBasisPoints = _feeBasisPoints;
        owner = msg.sender;
    }
    
    /**
     * @notice Execute a trade on Opinion.trade and collect fee
     * @param marketId The market ID
     * @param side true for YES, false for NO
     * @param amount Total amount including fee (in wei)
     * @param signature EIP712 signature from user
     * @return tradeId The ID of the recorded trade
     */
    function executeTrade(
        uint256 marketId,
        bool side,
        uint256 amount,
        bytes calldata signature
    ) external payable returns (uint256 tradeId) {
        require(msg.value >= amount, "Insufficient payment");
        require(amount >= MIN_ORDER_AMOUNT, "Order too small");
        
        // Calculate fee
        uint256 fee = (amount * feeBasisPoints) / 10000;
        require(fee >= MIN_FEE_AMOUNT, "Fee too small");
        
        uint256 amountAfterFee = amount - fee;
        
        // Execute trade on Opinion exchange
        bool success = IOpinionExchange(opinionExchange).executeOrder(
            marketId,
            side,
            amountAfterFee,
            signature
        );
        
        require(success, "Trade execution failed");
        
        // Record trade
        tradeId = ++tradeCounter;
        trades[tradeId] = Trade({
            user: msg.sender,
            marketId: marketId,
            side: side,
            amount: amount,
            fee: fee,
            timestamp: block.timestamp,
            executed: true
        });
        
        userTrades[msg.sender].push(tradeId);
        
        // Transfer fee to fee wallet
        (bool feeSent, ) = payable(feeWallet).call{value: fee}("");
        require(feeSent, "Fee transfer failed");
        
        emit TradeExecuted(tradeId, msg.sender, marketId, side, amount, fee);
        emit FeeCollected(msg.sender, fee, block.timestamp);
        
        return tradeId;
    }
    
    /**
     * @notice Get all trade IDs for a user
     * @param user The user address
     * @return Array of trade IDs
     */
    function getUserTrades(address user) external view returns (uint256[] memory) {
        return userTrades[user];
    }
    
    /**
     * @notice Get trade details by ID
     * @param tradeId The trade ID
     * @return Trade struct
     */
    function getTrade(uint256 tradeId) external view returns (Trade memory) {
        return trades[tradeId];
    }
    
    /**
     * @notice Update fee wallet (owner only)
     * @param newFeeWallet New fee wallet address
     */
    function setFeeWallet(address newFeeWallet) external onlyOwner {
        require(newFeeWallet != address(0), "Invalid address");
        address oldWallet = feeWallet;
        feeWallet = newFeeWallet;
        emit FeeWalletUpdated(oldWallet, newFeeWallet);
    }
    
    /**
     * @notice Update fee basis points (owner only)
     * @param newBasisPoints New fee basis points (max 1000 = 10%)
     */
    function setFeeBasisPoints(uint256 newBasisPoints) external onlyOwner {
        require(newBasisPoints <= 1000, "Fee too high");
        uint256 oldBasisPoints = feeBasisPoints;
        feeBasisPoints = newBasisPoints;
        emit FeeBasisPointsUpdated(oldBasisPoints, newBasisPoints);
    }
    
    /**
     * @notice Calculate fee for a given amount
     * @param amount Trade amount
     * @return fee Calculated fee
     */
    function calculateFee(uint256 amount) external view returns (uint256 fee) {
        fee = (amount * feeBasisPoints) / 10000;
        if (fee < MIN_FEE_AMOUNT) {
            fee = MIN_FEE_AMOUNT;
        }
        return fee;
    }
    
    /**
     * @notice Get total number of trades
     * @return Total trades
     */
    function getTotalTrades() external view returns (uint256) {
        return tradeCounter;
    }
}

