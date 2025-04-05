// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IPrizeVault {
    function claim(uint256 taskId, address winner) external;
    function refund(uint256 taskId, address creator) external;
    function getVaultAmount(uint256 taskId) external view returns (uint256);
    event Deposit(uint256 taskId, uint256 amount, address token);
    event Claim(uint256 taskId, address winner, uint256 amount);
    event Refund(uint256 taskId, address creator, uint256 amount);
}

contract PrizeVault {
    mapping(uint256 => uint256) public vaults;
    mapping(uint256 => address) public prizeTokens;
    address public taskCore;

    event Deposit(uint256 taskId, uint256 amount, address token);
    event Claim(uint256 taskId, address winner, uint256 amount);
    event Refund(uint256 taskId, address creator, uint256 amount);

    constructor(address _taskCore) {
        taskCore = _taskCore;
    }

    function deposit(uint256 taskId, uint256 amount, address token) external payable {
        if (token == address(0)) {
            require(msg.value == amount, "ETH value mismatch");
        }
        prizeTokens[taskId] = token;
        vaults[taskId] += amount;
        emit Deposit(taskId, amount, token);
    }

    function claim(uint256 taskId, address winner) external {
        require(msg.sender == taskCore, "Only TaskCore");
        uint256 amount = vaults[taskId];
        require(amount > 0, "Nothing to claim");
        vaults[taskId] = 0;
        address token = prizeTokens[taskId];
        if (token == address(0)) {
            payable(winner).transfer(amount);
        } else {
            SafeERC20.safeTransfer(IERC20(token), winner, amount);
        }
        emit Claim(taskId, winner, amount);
    }

    function refund(uint256 taskId, address creator) external {
        require(msg.sender == taskCore, "Only TaskCore");
        uint256 amount = vaults[taskId];
        require(amount > 0, "Nothing to refund");
        vaults[taskId] = 0;
        address token = prizeTokens[taskId];
        if (token == address(0)) {
            payable(creator).transfer(amount);
        } else {
            SafeERC20.safeTransfer(IERC20(token), creator, amount);
        }
        emit Refund(taskId, creator, amount);
    }

    function getVaultAmount(uint256 taskId) external view returns (uint256) {
        return vaults[taskId];
    }
}

