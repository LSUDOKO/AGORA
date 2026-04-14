// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TestUSDC
/// @notice Minimal ERC20 token for AGORA testnet demos when canonical X Layer testnet USDC is unavailable.
contract TestUSDC {
    string public constant name = "AGORA Test USDC";
    string public constant symbol = "tUSDC";
    uint8 public constant decimals = 6;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event Mint(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "TestUSDC: caller is not owner");
        _;
    }

    /// @notice Creates the token and mints initial supply to the deployer.
    /// @param initialOwner Owner allowed to mint additional supply.
    /// @param initialSupply Initial supply in 6-decimal base units.
    constructor(address initialOwner, uint256 initialSupply) {
        require(initialOwner != address(0), "TestUSDC: owner required");
        owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
        _mint(initialOwner, initialSupply);
    }

    /// @notice Transfers token ownership.
    /// @param newOwner New token owner.
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "TestUSDC: new owner required");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /// @notice Mints additional supply for testing and demo usage.
    /// @param to Recipient of newly minted tokens.
    /// @param amount Amount to mint in base units.
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "TestUSDC: recipient required");
        require(amount > 0, "TestUSDC: amount must be > 0");
        _mint(to, amount);
        emit Mint(to, amount);
    }

    /// @notice Transfers tokens to a recipient.
    /// @param to Recipient address.
    /// @param amount Amount to transfer.
    /// @return success Whether the transfer succeeded.
    function transfer(address to, uint256 amount) external returns (bool success) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    /// @notice Approves a spender to transfer tokens on behalf of the caller.
    /// @param spender Spender address.
    /// @param amount Allowance amount.
    /// @return success Whether the approval succeeded.
    function approve(address spender, uint256 amount) external returns (bool success) {
        require(spender != address(0), "TestUSDC: spender required");
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /// @notice Transfers tokens using an allowance.
    /// @param from Token owner.
    /// @param to Recipient address.
    /// @param amount Amount to transfer.
    /// @return success Whether the transfer succeeded.
    function transferFrom(address from, address to, uint256 amount) external returns (bool success) {
        uint256 currentAllowance = allowance[from][msg.sender];
        require(currentAllowance >= amount, "TestUSDC: insufficient allowance");

        unchecked {
            allowance[from][msg.sender] = currentAllowance - amount;
        }

        emit Approval(from, msg.sender, allowance[from][msg.sender]);
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "TestUSDC: sender required");
        require(to != address(0), "TestUSDC: recipient required");
        require(amount > 0, "TestUSDC: amount must be > 0");
        require(balanceOf[from] >= amount, "TestUSDC: insufficient balance");

        unchecked {
            balanceOf[from] -= amount;
            balanceOf[to] += amount;
        }

        emit Transfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal {
        require(to != address(0), "TestUSDC: recipient required");
        require(amount > 0, "TestUSDC: amount must be > 0");

        totalSupply += amount;
        balanceOf[to] += amount;

        emit Transfer(address(0), to, amount);
    }
}
