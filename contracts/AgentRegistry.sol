// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AgentRegistry
/// @notice Registers user-owned Prime Agents on-chain for AGORA.
contract AgentRegistry {
    struct Agent {
        address owner;
        string name;
        uint256 totalTxns;
        uint256 totalEarned;
        bool exists;
    }

    mapping(uint256 => Agent) public agents;
    mapping(address => uint256) public ownerToAgentId;
    uint256 public agentCount;

    event AgentRegistered(uint256 indexed agentId, address indexed owner, string name);
    event AgentTxCountIncremented(uint256 indexed agentId, uint256 newTotalTxns);
    event AgentEarningsRecorded(uint256 indexed agentId, uint256 amount, uint256 newTotalEarned);

    /// @notice Registers a new agent for the caller.
    /// @param name Human-readable agent name.
    /// @return agentId Newly created agent identifier.
    function registerAgent(string calldata name) external returns (uint256 agentId) {
        require(bytes(name).length > 0, "AgentRegistry: name required");
        require(ownerToAgentId[msg.sender] == 0, "AgentRegistry: owner already registered");

        agentId = ++agentCount;
        agents[agentId] = Agent({
            owner: msg.sender,
            name: name,
            totalTxns: 0,
            totalEarned: 0,
            exists: true
        });
        ownerToAgentId[msg.sender] = agentId;

        emit AgentRegistered(agentId, msg.sender, name);
    }

    /// @notice Returns the full agent profile for a given id.
    /// @param agentId Agent identifier.
    /// @return owner Agent owner address.
    /// @return name Agent display name.
    /// @return totalTxns Total transaction count tracked in registry.
    /// @return totalEarned Total earnings tracked in smallest unit.
    function getAgent(uint256 agentId)
        external
        view
        returns (address owner, string memory name, uint256 totalTxns, uint256 totalEarned)
    {
        Agent storage agent = agents[agentId];
        require(agent.exists, "AgentRegistry: agent not found");
        return (agent.owner, agent.name, agent.totalTxns, agent.totalEarned);
    }

    /// @notice Increments the transaction count for the caller's agent.
    /// @param agentId Agent identifier.
    function incrementTxCount(uint256 agentId) external {
        Agent storage agent = agents[agentId];
        require(agent.exists, "AgentRegistry: agent not found");
        require(agent.owner == msg.sender, "AgentRegistry: caller not agent owner");

        agent.totalTxns += 1;
        emit AgentTxCountIncremented(agentId, agent.totalTxns);
    }

    /// @notice Records earnings for the caller's agent.
    /// @param agentId Agent identifier.
    /// @param amount Earnings amount in the smallest token denomination.
    function recordEarnings(uint256 agentId, uint256 amount) external {
        Agent storage agent = agents[agentId];
        require(agent.exists, "AgentRegistry: agent not found");
        require(agent.owner == msg.sender, "AgentRegistry: caller not agent owner");
        require(amount > 0, "AgentRegistry: amount must be > 0");

        agent.totalEarned += amount;
        emit AgentEarningsRecorded(agentId, amount, agent.totalEarned);
    }

    /// @notice Returns all agents registered in the protocol.
    /// @return allAgents Array of all Agent structs.
    function getAllAgents() external view returns (Agent[] memory allAgents) {
        allAgents = new Agent[](agentCount);
        for (uint256 i = 1; i <= agentCount; i++) {
            allAgents[i - 1] = agents[i];
        }
    }
}
