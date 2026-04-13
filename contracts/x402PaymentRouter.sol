// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

interface IAgentRegistry {
    function getAgent(uint256 agentId)
        external
        view
        returns (address owner, string memory name, uint256 totalTxns, uint256 totalEarned);
}

interface ISkillsRegistry {
    function getSkill(uint256 skillId)
        external
        view
        returns (address provider, string memory name, uint256 priceUSDC, uint256 totalHires);

    function incrementHireCount(uint256 skillId) external;
}

interface ILeaderboardTracker {
    function recordActivity(uint256 agentId, uint256 txCount, uint256 usdcPaid) external;
}

/// @title x402PaymentRouter
/// @notice Routes real on-chain USDC payments when AGORA agents hire skills.
contract x402PaymentRouter {
    struct Receipt {
        uint256 agentId;
        uint256 skillId;
        uint256 amount;
        uint256 timestamp;
        bool completed;
    }

    IERC20 public immutable usdc;
    IAgentRegistry public immutable agentRegistry;
    ISkillsRegistry public immutable skillsRegistry;
    ILeaderboardTracker public immutable leaderboardTracker;
    uint256 public receiptCount;
    mapping(uint256 => Receipt) public receipts;

    event SkillHired(
        uint256 indexed receiptId,
        uint256 indexed agentId,
        uint256 indexed skillId,
        address provider,
        uint256 amount
    );
    event SkillCompleted(uint256 indexed receiptId);

    /// @notice Configures the router dependencies.
    /// @param usdcToken USDC token address used for payments.
    /// @param agentRegistryAddress Agent registry contract address.
    /// @param skillsRegistryAddress Skills registry contract address.
    /// @param leaderboardTrackerAddress Leaderboard tracker contract address.
    constructor(
        address usdcToken,
        address agentRegistryAddress,
        address skillsRegistryAddress,
        address leaderboardTrackerAddress
    ) {
        require(usdcToken != address(0), "x402PaymentRouter: USDC required");
        require(agentRegistryAddress != address(0), "x402PaymentRouter: agent registry required");
        require(skillsRegistryAddress != address(0), "x402PaymentRouter: skills registry required");
        require(leaderboardTrackerAddress != address(0), "x402PaymentRouter: leaderboard required");

        usdc = IERC20(usdcToken);
        agentRegistry = IAgentRegistry(agentRegistryAddress);
        skillsRegistry = ISkillsRegistry(skillsRegistryAddress);
        leaderboardTracker = ILeaderboardTracker(leaderboardTrackerAddress);
    }

    /// @notice Hires a skill and transfers USDC from the agent owner to the skill provider.
    /// @param agentId Agent identifier hiring the skill.
    /// @param skillId Skill identifier being hired.
    /// @return receiptId Newly created payment receipt identifier.
    function hireSkill(uint256 agentId, uint256 skillId) external returns (uint256 receiptId) {
        (address owner,,,) = agentRegistry.getAgent(agentId);
        require(owner == msg.sender, "x402PaymentRouter: caller not agent owner");

        (address provider,, uint256 priceUSDC,) = skillsRegistry.getSkill(skillId);
        require(provider != address(0), "x402PaymentRouter: invalid provider");
        require(provider != msg.sender, "x402PaymentRouter: self hire not allowed");
        require(priceUSDC > 0, "x402PaymentRouter: invalid skill price");

        bool success = usdc.transferFrom(msg.sender, provider, priceUSDC);
        require(success, "x402PaymentRouter: USDC transfer failed");

        receiptId = ++receiptCount;
        receipts[receiptId] = Receipt({
            agentId: agentId,
            skillId: skillId,
            amount: priceUSDC,
            timestamp: block.timestamp,
            completed: false
        });

        skillsRegistry.incrementHireCount(skillId);
        leaderboardTracker.recordActivity(agentId, 1, priceUSDC);

        emit SkillHired(receiptId, agentId, skillId, provider, priceUSDC);
    }

    /// @notice Returns payment receipt information.
    /// @param receiptId Receipt identifier.
    /// @return agentId Agent that hired the skill.
    /// @return skillId Skill that was hired.
    /// @return amount Amount paid in USDC base units.
    /// @return timestamp Receipt creation timestamp.
    /// @return completed Whether the provider marked the task complete.
    function getReceipt(uint256 receiptId)
        external
        view
        returns (uint256 agentId, uint256 skillId, uint256 amount, uint256 timestamp, bool completed)
    {
        Receipt storage receipt = receipts[receiptId];
        require(receipt.timestamp != 0, "x402PaymentRouter: receipt not found");
        return (receipt.agentId, receipt.skillId, receipt.amount, receipt.timestamp, receipt.completed);
    }

    /// @notice Marks a receipt as completed once the provider finishes the task.
    /// @param receiptId Receipt identifier.
    function markCompleted(uint256 receiptId) external {
        Receipt storage receipt = receipts[receiptId];
        require(receipt.timestamp != 0, "x402PaymentRouter: receipt not found");
        require(!receipt.completed, "x402PaymentRouter: already completed");

        (address provider,,,) = skillsRegistry.getSkill(receipt.skillId);
        require(provider == msg.sender, "x402PaymentRouter: caller not provider");

        receipt.completed = true;
        emit SkillCompleted(receiptId);
    }
}
