// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Interface for Opinion.trade exchange contract
 * This will need to be updated based on actual Opinion contract ABI
 */
interface IOpinionExchange {
    /**
     * Execute an order on Opinion.trade
     * @param marketId The market ID
     * @param side true for YES, false for NO
     * @param amount Amount in wei (or token units)
     * @param signature EIP712 signature from user
     * @return success Whether the order was executed successfully
     */
    function executeOrder(
        uint256 marketId,
        bool side,
        uint256 amount,
        bytes calldata signature
    ) external returns (bool success);
    
    /**
     * Get the current price for a market side
     * @param marketId The market ID
     * @param side true for YES, false for NO
     * @return price Current price (0-1 range, scaled)
     */
    function getPrice(uint256 marketId, bool side) external view returns (uint256 price);
}

