// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

error PermissionExpired();
error PermissionInvalidSignature();
error PermissionUnauthorized();
error PermissionInvalidValidator();

struct Permission {
    address issuer;
    uint64 expiration;
    address recipient;
    uint256 validatorId;
    address validatorContract;
    bytes32 sealingKey;
    bytes issuerSignature;
    bytes recipientSignature;
}

interface IPermissionCustomIdValidator {
    function disabled(address issuer, uint256 id) external view returns (bool);
}

library PermissionUtils {
    bytes32 internal constant PERMISSIONED_V2_ISSUER_SELF =
        keccak256(
            "PermissionedV2IssuerSelf(address issuer,uint64 expiration,address recipient,uint256 validatorId,address validatorContract,bytes32 sealingKey)"
        );
    bytes32 internal constant PERMISSIONED_V2_ISSUER_SHARED =
        keccak256(
            "PermissionedV2IssuerShared(address issuer,uint64 expiration,address recipient,uint256 validatorId,address validatorContract)"
        );
    bytes32 internal constant PERMISSIONED_V2_RECIPIENT =
        keccak256("PermissionedV2Recipient(bytes32 sealingKey,bytes issuerSignature)");

    function issuerHash(Permission memory permission) internal pure returns (bytes32) {
        if (permission.recipient == address(0)) {
            return
                keccak256(
                    abi.encode(
                        PERMISSIONED_V2_ISSUER_SELF,
                        permission.issuer,
                        permission.expiration,
                        permission.recipient,
                        permission.validatorId,
                        permission.validatorContract,
                        permission.sealingKey
                    )
                );
        }

        return
            keccak256(
                abi.encode(
                    PERMISSIONED_V2_ISSUER_SHARED,
                    permission.issuer,
                    permission.expiration,
                    permission.recipient,
                    permission.validatorId,
                    permission.validatorContract
                )
            );
    }

    function recipientHash(Permission memory permission) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    PERMISSIONED_V2_RECIPIENT,
                    permission.sealingKey,
                    keccak256(permission.issuerSignature)
                )
            );
    }
}

abstract contract PermissionedV2 is EIP712 {
    using PermissionUtils for Permission;

    constructor() EIP712("ACL", "1") {}

    modifier withPermission(Permission calldata permission) {
        if (permission.expiration != 0 && block.timestamp > permission.expiration) {
            revert PermissionExpired();
        }

        bytes32 issuerDigest = _hashTypedDataV4(permission.issuerHash());
        if (!SignatureChecker.isValidSignatureNow(permission.issuer, issuerDigest, permission.issuerSignature)) {
            revert PermissionInvalidSignature();
        }

        if (permission.recipient != address(0)) {
            bytes32 recipientDigest = _hashTypedDataV4(permission.recipientHash());
            if (!SignatureChecker.isValidSignatureNow(
                permission.recipient,
                recipientDigest,
                permission.recipientSignature
            )) {
                revert PermissionInvalidSignature();
            }
            if (msg.sender != permission.recipient) {
                revert PermissionUnauthorized();
            }
        } else if (msg.sender != permission.issuer) {
            revert PermissionUnauthorized();
        }

        if (permission.validatorId != 0) {
            if (permission.validatorContract == address(0)) {
                revert PermissionInvalidValidator();
            }
            bool isDisabled = IPermissionCustomIdValidator(permission.validatorContract).disabled(
                permission.issuer,
                permission.validatorId
            );
            if (isDisabled) {
                revert PermissionInvalidValidator();
            }
        }

        _;
    }
}
