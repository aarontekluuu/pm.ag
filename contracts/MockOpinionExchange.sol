// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IOpinionExchange.sol";

/**
 * @title MockOpinionExchange
 * @notice Mock implementation of Opinion.trade exchange for testing
 * @dev This contract always succeeds for testing purposes
 *      In production, this will be replaced with the actual Opinion contract address
 */
contract MockOpinionExchange is IOpinionExchange {
    mapping(uint256 => mapping(bool => uint256)) public prices;
    
    event OrderExecuted(
        uint256 indexed marketId,
        bool side,
        uint256 amount,
        address indexed user
    );
    
    constructor() {
        // Initialize some default prices for testing
        // Market 1: YES = 0.6, NO = 0.4
        prices[1][true] = 6000; // 60% scaled by 10000
        prices[1][false] = 4000; // 40% scaled by 10000
        
        // Market 2: YES = 0.5, NO = 0.5
        prices[2][true] = 5000;
        prices[2][false] = 5000;
    }
    
    /**
     * @notice Execute an order (always succeeds for testing)
     */
    function executeOrder(
        uint256 marketId,
        bool side,
        uint256 amount,
        bytes calldata /* signature */
    ) external override returns (bool success) {
        // Mock implementation - always succeeds
        emit OrderExecuted(marketId, side, amount, msg.sender);
        return true;
    }
    
    /**
     * @notice Get the current price for a market side
     */
    function getPrice(uint256 marketId, bool side) external view override returns (uint256 price) {
        return prices[marketId][side];
    }
    
    /**
     * @notice Set price for testing
     */
    function setPrice(uint256 marketId, bool side, uint256 price) external {
        prices[marketId][side] = price;
    }
}

