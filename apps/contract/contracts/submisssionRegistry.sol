// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IIdentityVerificationHubV1} from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV1.sol";
import {IVcAndDiscloseCircuitVerifier} from "@selfxyz/contracts/contracts/interfaces/IVcAndDiscloseCircuitVerifier.sol";
import {CircuitConstants} from "@selfxyz/contracts/contracts/constants/CircuitConstants.sol";

contract SubmissionRegistry {
    struct Submission {
        address user;
        string contentHash;
        uint8 score;
        string feedbackHash;
        bool rewarded;
    }

    struct VerificationConfig {
        uint256 scope;
        uint256 attestationId;
        bool olderThanEnabled;
        uint256 olderThan;
        bool forbiddenCountriesEnabled;
        uint256[4] forbiddenCountriesListPacked;
        bool[3] ofacEnabled;
        bool exists;
    }
    mapping(uint256 => address) public taskOwners;
    mapping(uint256 => Submission[]) public submissions;
    mapping(uint256 => VerificationConfig) public taskConfigs;
    mapping(uint256 => mapping(address => bool)) public verifiedUsers;
    mapping(uint256 => mapping(uint256 => bool)) internal _nullifiers;

    address public oracle;
    address public taskCore;
    IIdentityVerificationHubV1 public immutable identityHub;

    event SubmissionCreated(uint256 taskId, address user, string contentHash);
    event ScoreStored(uint256 taskId, address user, uint8 score);
    event TaskRegistered(address user);

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle");
        _;
    }

    modifier onlyTaskCore() {
        require(msg.sender == taskCore, "Only TaskCore");
        _;
    }

    constructor(address _oracle, address _taskCore, address _identityHub) {
        oracle = _oracle;
        taskCore = _taskCore;
        identityHub = IIdentityVerificationHubV1(_identityHub);
    }

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
    ) external onlyTaskCore {
        taskConfigs[taskId] = VerificationConfig({
            scope: scope,
            attestationId: attestationId,
            olderThanEnabled: olderThanEnabled,
            olderThan: olderThan,
            forbiddenCountriesEnabled: forbiddenCountriesEnabled,
            forbiddenCountriesListPacked: forbiddenCountriesListPacked,
            ofacEnabled: ofacEnabled,
            exists: true
        });
        taskOwners[taskId] = taskOwner;
    }

    function getTaskOwner(uint256 taskId) external view returns (address) {
        return taskOwners[taskId];
    }

    function setTaskVerificationConfigByOwner(
        uint256 taskId,
        uint256 scope,
        uint256 attestationId,
        bool olderThanEnabled,
        uint256 olderThan,
        bool forbiddenCountriesEnabled,
        uint256[4] calldata forbiddenCountriesListPacked,
        bool[3] calldata ofacEnabled
    ) external {
        require(msg.sender == taskOwners[taskId], "Not task owner");
        taskConfigs[taskId] = VerificationConfig({
            scope: scope,
            attestationId: attestationId,
            olderThanEnabled: olderThanEnabled,
            olderThan: olderThan,
            forbiddenCountriesEnabled: forbiddenCountriesEnabled,
            forbiddenCountriesListPacked: forbiddenCountriesListPacked,
            ofacEnabled: ofacEnabled,
            exists: true
        });
    }

    function verifySelfProof(
        IVcAndDiscloseCircuitVerifier.VcAndDiscloseProof memory proof,
        uint256 taskId
    ) public {
        VerificationConfig memory config = taskConfigs[taskId];
        require(config.exists, "Task config not found");

        if (config.scope != proof.pubSignals[CircuitConstants.VC_AND_DISCLOSE_SCOPE_INDEX]) revert("InvalidScope");
        if (config.attestationId != proof.pubSignals[CircuitConstants.VC_AND_DISCLOSE_ATTESTATION_ID_INDEX]) revert("InvalidAttestationId");

        uint256 nullifier = proof.pubSignals[CircuitConstants.VC_AND_DISCLOSE_NULLIFIER_INDEX];
        require(!_nullifiers[taskId][nullifier], "RegisteredNullifier");

        IIdentityVerificationHubV1.VcAndDiscloseVerificationResult memory result = identityHub.verifyVcAndDisclose(
            IIdentityVerificationHubV1.VcAndDiscloseHubProof({
                olderThanEnabled: config.olderThanEnabled,
                olderThan: config.olderThan,
                forbiddenCountriesEnabled: config.forbiddenCountriesEnabled,
                forbiddenCountriesListPacked: config.forbiddenCountriesListPacked,
                ofacEnabled: config.ofacEnabled,
                vcAndDiscloseProof: proof
            })
        );

        address user = address(uint160(result.userIdentifier));
        _nullifiers[taskId][result.nullifier] = true;
        verifiedUsers[taskId][user] = true;

        emit TaskRegistered(user);
    }

    function submit(uint256 taskId, string calldata contentHash) external {
        // require(verifiedUsers[taskId][msg.sender], "Not verified");

        submissions[taskId].push(Submission({
            user: msg.sender,
            contentHash: contentHash,
            score: 0,
            feedbackHash: "",
            rewarded: false
        }));

        emit SubmissionCreated(taskId, msg.sender, contentHash);
    }

    function storeScore(uint256 taskId, uint256 index, uint8 score, string calldata feedbackHash) external onlyOracle {
        Submission storage s = submissions[taskId][index];
        s.score = score;
        s.feedbackHash = feedbackHash;
        emit ScoreStored(taskId, s.user, score);
    }

    function getTopScorer(uint256 taskId) external view returns (address topUser, uint8 topScore) {
        Submission[] storage sList = submissions[taskId];
        for (uint i = 0; i < sList.length; i++) {
            if (sList[i].score > topScore) {
                topUser = sList[i].user;
                topScore = sList[i].score;
            }
        }
    }
}
