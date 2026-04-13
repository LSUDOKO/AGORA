// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title LeaderboardTracker
/// @notice Tracks AGORA agent activity for leaderboard views.
contract LeaderboardTracker {
    struct AgentActivity {
        uint256 agentId;
        uint256 txCount;
        uint256 usdcPaid;
    }

    address public immutable paymentRouter;
    mapping(uint256 => AgentActivity) public activities;
    uint256[] public trackedAgentIds;
    mapping(uint256 => bool) public isTracked;

    event ActivityRecorded(uint256 indexed agentId, uint256 totalTxns, uint256 totalUsdcPaid);

    /// @notice Sets the payment router allowed to push leaderboard updates.
    /// @param _paymentRouter Deployed x402 payment router address.
    constructor(address _paymentRouter) {
        require(_paymentRouter != address(0), "LeaderboardTracker: router required");
        paymentRouter = _paymentRouter;
    }

    /// @notice Records activity for an agent.
    /// @param agentId Agent identifier.
    /// @param txCount Additional transactions to add.
    /// @param usdcPaid Additional USDC amount paid to add.
    function recordActivity(uint256 agentId, uint256 txCount, uint256 usdcPaid) external {
        require(msg.sender == paymentRouter, "LeaderboardTracker: caller not router");
        require(agentId > 0, "LeaderboardTracker: invalid agent id");

        if (!isTracked[agentId]) {
            isTracked[agentId] = true;
            trackedAgentIds.push(agentId);
            activities[agentId].agentId = agentId;
        }

        AgentActivity storage activity = activities[agentId];
        activity.txCount += txCount;
        activity.usdcPaid += usdcPaid;

        emit ActivityRecorded(agentId, activity.txCount, activity.usdcPaid);
    }

    /// @notice Returns the top agents sorted by transaction count, then USDC paid.
    /// @param limit Maximum number of agents to return.
    /// @return topAgents Sorted leaderboard entries.
    function getTopAgents(uint256 limit) external view returns (AgentActivity[] memory topAgents) {
        uint256 total = trackedAgentIds.length;
        if (limit > total) {
            limit = total;
        }

        AgentActivity[] memory allAgents = new AgentActivity[](total);
        for (uint256 i = 0; i < total; i++) {
            allAgents[i] = activities[trackedAgentIds[i]];
        }

        for (uint256 i = 0; i < total; i++) {
            for (uint256 j = i + 1; j < total; j++) {
                bool shouldSwap = allAgents[j].txCount > allAgents[i].txCount
                    || (allAgents[j].txCount == allAgents[i].txCount && allAgents[j].usdcPaid > allAgents[i].usdcPaid);

                if (shouldSwap) {
                    AgentActivity memory temp = allAgents[i];
                    allAgents[i] = allAgents[j];
                    allAgents[j] = temp;
                }
            }
        }

        topAgents = new AgentActivity[](limit);
        for (uint256 i = 0; i < limit; i++) {
            topAgents[i] = allAgents[i];
        }
    }
}
