// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SkillsRegistry
/// @notice Registry for reusable AGORA sub-agent skills.
contract SkillsRegistry {
    struct Skill {
        address provider;
        string name;
        string description;
        uint256 priceUSDC;
        uint256 totalHires;
        bool exists;
    }

    mapping(uint256 => Skill) public skills;
    uint256 public skillCount;

    event SkillRegistered(uint256 indexed skillId, address indexed provider, string name, uint256 priceUSDC);
    event SkillHireCountIncremented(uint256 indexed skillId, uint256 newTotalHires);

    /// @notice Registers a new skill offered by the caller.
    /// @param name Human-readable skill name.
    /// @param description Short skill description.
    /// @param priceUSDC Price per hire in USDC base units (6 decimals).
    /// @return skillId Newly created skill identifier.
    function registerSkill(
        string calldata name,
        string calldata description,
        uint256 priceUSDC
    ) external returns (uint256 skillId) {
        require(bytes(name).length > 0, "SkillsRegistry: name required");
        require(bytes(description).length > 0, "SkillsRegistry: description required");
        require(priceUSDC > 0, "SkillsRegistry: price must be > 0");

        skillId = ++skillCount;
        skills[skillId] = Skill({
            provider: msg.sender,
            name: name,
            description: description,
            priceUSDC: priceUSDC,
            totalHires: 0,
            exists: true
        });

        emit SkillRegistered(skillId, msg.sender, name, priceUSDC);
    }

    /// @notice Returns core skill information.
    /// @param skillId Skill identifier.
    /// @return provider Skill provider address.
    /// @return name Skill name.
    /// @return priceUSDC Price per call in USDC base units.
    /// @return totalHires Number of times the skill has been hired.
    function getSkill(uint256 skillId)
        external
        view
        returns (address provider, string memory name, uint256 priceUSDC, uint256 totalHires)
    {
        Skill storage skill = skills[skillId];
        require(skill.exists, "SkillsRegistry: skill not found");
        return (skill.provider, skill.name, skill.priceUSDC, skill.totalHires);
    }

    /// @notice Returns the description for a skill.
    /// @param skillId Skill identifier.
    /// @return description The registered skill description.
    function getSkillDescription(uint256 skillId) external view returns (string memory description) {
        Skill storage skill = skills[skillId];
        require(skill.exists, "SkillsRegistry: skill not found");
        return skill.description;
    }

    /// @notice Increments the total hire count for a skill.
    /// @dev Intended to be called by the payment router after a successful hire.
    /// @param skillId Skill identifier.
    function incrementHireCount(uint256 skillId) external {
        Skill storage skill = skills[skillId];
        require(skill.exists, "SkillsRegistry: skill not found");

        skill.totalHires += 1;
        emit SkillHireCountIncremented(skillId, skill.totalHires);
    }

    /// @notice Returns all skills registered in the protocol.
    /// @return allSkills Array of all Skill structs.
    function getAllSkills() external view returns (Skill[] memory allSkills) {
        allSkills = new Skill[](skillCount);
        for (uint256 i = 1; i <= skillCount; i++) {
            allSkills[i - 1] = skills[i];
        }
    }
}
