// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IPrizeVault {
    function claim(uint256 taskId, address winner, uint256 amount) external;
    function refund(uint256 taskId, address creator) external;
    function getVaultAmount(uint256 taskId) external view returns (uint256);
    function setTaskClaimLimits(uint256 taskId, uint256 maxPerTime, uint256 maxPerDay) external;
    event Deposit(uint256 taskId, uint256 amount, address token);
    event Claim(uint256 taskId, address winner, uint256 amount);
    event Refund(uint256 taskId, address creator, uint256 amount);
    event TaskClaimLimitsSet(uint256 taskId, uint256 maxPerTime, uint256 maxPerDay);
}

contract PrizeVault is Ownable {
    using SafeERC20 for IERC20;

    mapping(uint256 => uint256) public vaults; // Task ID => Amount
    mapping(uint256 => address) public prizeTokens; // Task ID => Token Address
    mapping(uint256 => uint256) public maxClaimPerTime; // Task ID => Max amount per claim
    mapping(uint256 => uint256) public maxClaimPerDay; // Task ID => Max amount per day
    mapping(uint256 => mapping(address => uint256)) public currentDayClaims; // Task ID => Winner => Amount claimed today
    mapping(uint256 => mapping(address => uint256)) public currentDayClaimCount; // Task ID => Winner => Number of claims today
    mapping(uint256 => mapping(address => uint256)) public lastClaimDay; // Task ID => Winner => Last claim day

    address public taskCore;
    address public judge;

    uint256 constant SECONDS_PER_DAY = 86400; // 24 hours in seconds

    event Deposit(uint256 taskId, uint256 amount, address token);
    event Claim(uint256 taskId, address winner, uint256 amount);
    event Refund(uint256 taskId, address creator, uint256 amount);
    event TaskClaimLimitsSet(uint256 taskId, uint256 maxPerTime, uint256 maxPerDay);

    constructor(address _taskCore, address _judge) Ownable(msg.sender) {
        taskCore = _taskCore;
        judge = _judge;
    }

    // Deposit ETH or ERC-20 tokens for a task
    function deposit(uint256 taskId, uint256 amount, address token, uint256 maxPerTime, uint256 maxPerDay) external payable {
        if (token == address(0)) {
            require(msg.value == amount, "ETH value mismatch");
        }
        prizeTokens[taskId] = token;
        maxClaimPerTime[taskId] = maxPerTime;
        maxClaimPerDay[taskId] = maxPerDay;
        vaults[taskId] += amount;
        emit Deposit(taskId, amount, token);
    }

    // Claim prize for a winner with task-specific limits
    function claim(uint256 taskId, address winner, uint256 amount) external {
        require(msg.sender == judge, "Only Judge");
        require(amount > 0, "Nothing to claim");
        require(vaults[taskId] >= amount, "Insufficient vault balance");

        // Calculate current day (Unix timestamp / seconds per day)
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;

        // Reset daily tracking for this task and winner if it's a new day
        if (lastClaimDay[taskId][winner] < currentDay) {
            currentDayClaims[taskId][winner] = 0;
            currentDayClaimCount[taskId][winner] = 0;
            lastClaimDay[taskId][winner] = currentDay;
        }

        // Check task-specific claim limits
        if (maxClaimPerTime[taskId] > 0) {
            require(amount <= maxClaimPerTime[taskId], "Exceeds max claim per time for task");
        }
        if (maxClaimPerDay[taskId] > 0) {
            require(
                currentDayClaims[taskId][winner] + amount <= maxClaimPerDay[taskId],
                "Exceeds max claim per day for task"
            );
        }

        // Update tracking
        vaults[taskId] -= amount;
        currentDayClaims[taskId][winner] += amount;
        currentDayClaimCount[taskId][winner] += 1;
        lastClaimDay[taskId][winner] = currentDay;

        // Transfer prize
        address token = prizeTokens[taskId];
        if (token == address(0)) {
            payable(winner).transfer(amount);
        } else {
            IERC20(token).safeTransfer(winner, amount);
        }

        emit Claim(taskId, winner, amount);
    }

    // Refund task creator
    function refund(uint256 taskId, address creator) external {
        require(msg.sender == taskCore, "Only TaskCore");
        uint256 amount = vaults[taskId];
        require(amount > 0, "Nothing to refund");
        vaults[taskId] = 0;
        address token = prizeTokens[taskId];
        if (token == address(0)) {
            payable(creator).transfer(amount);
        } else {
            IERC20(token).safeTransfer(creator, amount);
        }
        emit Refund(taskId, creator, amount);
    }

    // Get vault amount
    function getVaultAmount(uint256 taskId) external view returns (uint256) {
        return vaults[taskId];
    }

    // Set maximum claim limits for a specific task (only owner)
    function setTaskClaimLimits(uint256 taskId, uint256 _maxPerTime, uint256 _maxPerDay) external onlyOwner {
        maxClaimPerTime[taskId] = _maxPerTime;
        maxClaimPerDay[taskId] = _maxPerDay;
        emit TaskClaimLimitsSet(taskId, _maxPerTime, _maxPerDay);
    }

    // Get winner's claim stats for a specific task (current day only)
    function getWinnerTaskClaimStats(uint256 taskId, address winner) 
        external 
        view 
        returns (uint256 amount, uint256 count, uint256 day) 
    {
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        if (lastClaimDay[taskId][winner] < currentDay) {
            return (0, 0, currentDay); // Return 0s if it's a new day
        }
        return (
            currentDayClaims[taskId][winner],
            currentDayClaimCount[taskId][winner],
            currentDay
        );
    }

    // Get task claim limits
    function getTaskClaimLimits(uint256 taskId) 
        external 
        view 
        returns (uint256 maxPerTime, uint256 maxPerDay) 
    {
        return (maxClaimPerTime[taskId], maxClaimPerDay[taskId]);
    }
}