// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {PrizeVault} from "./prizeVault.sol";

interface ISubmissionRegistry {
    function initTaskVerificationConfig(
        uint256 taskId,
        uint256 scope,
        uint256 attestationId,
        bool olderThanEnabled,
        uint256 olderThan,
        bool forbiddenCountriesEnabled,
        uint256[4] calldata forbiddenCountriesListPacked,
        bool[3] calldata ofacEnabled,
        address taskOwner
    ) external;
}

contract TaskVaultCore is Ownable{
    struct Task {
        address creator;
        uint256 deadline;
        string[] criteria;
        bytes32 styleCommit;
        bool styleRevealed;
        string revealedStyle;
        bool judged;
        address prizeVault;
        address prizeToken; // 0x0 for native token
        // Verification config
        uint256 scope;
        uint256 attestationId;
        bool olderThanEnabled;
        uint256 olderThan;
        bool forbiddenCountriesEnabled;
        uint256[4] forbiddenCountriesListPacked;
        bool[3] ofacEnabled;
        uint256 maxPerTime;
        uint256 maxPerDay;
    }

    uint256 public taskCounter;
    address prizeVault;
    address public submissionRegistry;
    mapping(uint256 => Task) public tasks;
    mapping(address => bool) public approvedTokens;

    event TaskCreated(uint256 taskId, address indexed creator, address prizeVault);
    event StyleRevealed(uint256 taskId, string style);
    event Judged(uint256 taskId);
    event TokenApproved(address token);
    event PrizeVaultUpdated(address vault);

    modifier onlyJudge() {
        require(msg.sender == judge, "Only judge");
        _;
    }

    address public judge;

    constructor(address _judge) Ownable(msg.sender){
        judge = _judge;
    }

    function setSubmissionRegistry(address _submissionRegistry) external onlyOwner {
        submissionRegistry = _submissionRegistry;
    }

    function approvePrizeToken(address token) external onlyJudge {
        approvedTokens[token] = true;
        emit TokenApproved(token);
    }

    function setPrizeVault(address _prizeVault) external onlyOwner {
        require(_prizeVault != address(0), "Invalid vault");
        prizeVault = _prizeVault;
        emit PrizeVaultUpdated(_prizeVault);
    }

    function createTask(
        string[] memory _criteria,
        bytes32 _styleCommit,
        uint256 _deadline,
        address _prizeToken,
        uint256 _prizeAmount,
        // Verification config parameters
        uint256 _scope,
        uint256 _attestationId,
        bool _olderThanEnabled,
        uint256 _olderThan,
        bool _forbiddenCountriesEnabled,
        uint256[4] calldata _forbiddenCountriesListPacked,
        bool[3] calldata _ofacEnabled,
        uint256 _maxPerTime,
        uint256 _maxPerDay
    ) external payable returns (uint256 taskId) {
        require(submissionRegistry != address(0), "Submission registry not set");
        require(_prizeToken == address(0) || approvedTokens[_prizeToken], "Token not approved");
        require(prizeVault != address(0), "vault not set");

        taskId = taskCounter++;

        if (_prizeToken == address(0)) {
            require(msg.value == _prizeAmount, "ETH prize mismatch");
            PrizeVault(prizeVault).deposit{value: msg.value}(taskId, _prizeAmount, _prizeToken, _maxPerTime, _maxPerDay);
        } else {
            IERC20(_prizeToken).transferFrom(msg.sender, prizeVault, _prizeAmount);
            PrizeVault(prizeVault).deposit(taskId, _prizeAmount, _prizeToken, _maxPerTime, _maxPerDay);
        }

        tasks[taskId] = Task({
            creator: msg.sender,
            deadline: _deadline,
            criteria: _criteria,
            styleCommit: _styleCommit,
            styleRevealed: false,
            revealedStyle: "",
            judged: false,
            prizeVault: prizeVault,
            prizeToken: _prizeToken,
            scope: _scope,
            attestationId: _attestationId,
            olderThanEnabled: _olderThanEnabled,
            olderThan: _olderThan,
            forbiddenCountriesEnabled: _forbiddenCountriesEnabled,
            forbiddenCountriesListPacked: _forbiddenCountriesListPacked,
            ofacEnabled: _ofacEnabled,
            maxPerTime: _maxPerTime,
            maxPerDay: _maxPerDay
        });

        // Set verification config in submission registry
        ISubmissionRegistry(submissionRegistry).initTaskVerificationConfig(
            taskId,
            _scope,
            _attestationId,
            _olderThanEnabled,
            _olderThan,
            _forbiddenCountriesEnabled,
            _forbiddenCountriesListPacked,
            _ofacEnabled,
            msg.sender
        );

        emit TaskCreated(taskId, msg.sender, prizeVault);
    }

    function revealStyle(uint256 taskId, string memory style, string memory salt) external onlyJudge {
        Task storage task = tasks[taskId];
        require(!task.styleRevealed, "Already revealed");
        require(keccak256(abi.encodePacked(style, salt)) == task.styleCommit, "Invalid reveal");

        task.revealedStyle = style;
        task.styleRevealed = true;

        emit StyleRevealed(taskId, style);
    }

    function markJudged(uint256 taskId) external onlyJudge {
        Task storage task = tasks[taskId];
        task.judged = true;
        emit Judged(taskId);
    }

    function refund(uint256 taskId) external {
        Task storage task = tasks[taskId];
        require(!task.judged, "Already judged");
        PrizeVault(task.prizeVault).refund(taskId, task.creator);
    }

    function getPrizeVault(uint256 taskId) external view returns (address) {
        return tasks[taskId].prizeVault;
    }

    function getPrizeAmount(uint256 taskId) external view returns (uint256) {
        return PrizeVault(tasks[taskId].prizeVault).getVaultAmount(taskId);
    }
}