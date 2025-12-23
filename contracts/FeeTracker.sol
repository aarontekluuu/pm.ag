// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FeeTracker
 * @notice Tracks fees collected per user and total fees
 * @dev Can be used separately or integrated into TradeRouter
 */
contract FeeTracker {
    mapping(address => uint256) public feesByUser;
    uint256 public totalFeesCollected;
    uint256 public totalTrades;
    
    address public owner;
    address public tradeRouter; // Only TradeRouter can record fees
    
    event FeeRecorded(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    event TradeRouterUpdated(address indexed oldRouter, address indexed newRouter);
    
    modifier onlyRouter() {
        require(msg.sender == tradeRouter, "Not authorized");
        _;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor(address _tradeRouter) {
        require(_tradeRouter != address(0), "Invalid router address");
        tradeRouter = _tradeRouter;
        owner = msg.sender;
    }
    
    /**
     * @notice Record a fee (called by TradeRouter)
     * @param user The user who paid the fee
     * @param amount The fee amount
     */
    function recordFee(address user, uint256 amount) external onlyRouter {
        require(user != address(0), "Invalid user");
        require(amount > 0, "Invalid amount");
        
        feesByUser[user] += amount;
        totalFeesCollected += amount;
        totalTrades++;
        
        emit FeeRecorded(user, amount, block.timestamp);
    }
    
    /**
     * @notice Get total fees paid by a user
     * @param user The user address
     * @return Total fees paid
     */
    function getUserFeeTotal(address user) external view returns (uint256) {
        return feesByUser[user];
    }
    
    /**
     * @notice Update trade router address (owner only)
     * @param newRouter New router address
     */
    function setTradeRouter(address newRouter) external onlyOwner {
        require(newRouter != address(0), "Invalid address");
        address oldRouter = tradeRouter;
        tradeRouter = newRouter;
        emit TradeRouterUpdated(oldRouter, newRouter);
    }
}

