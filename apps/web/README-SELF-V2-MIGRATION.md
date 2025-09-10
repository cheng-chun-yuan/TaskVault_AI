# Self Protocol V1 to V2 Migration Guide

This document outlines the migration from Self Protocol V1 to V2 for the TaskVault AI project.

## Overview of Changes

Self Protocol V2 introduces several key improvements:
- Multi-document support (E-Passports, EU ID Cards)
- Enhanced disclosure configuration
- Improved backend verification
- Better error handling and validation

## Dependencies Updated

```bash
# Removed v1 dependencies
bun remove @selfxyz/core@^0.0.23 @selfxyz/qrcode@^0.0.17

# Added v2 dependencies
bun add @selfxyz/core@^1.0.8 @selfxyz/qrcode@^1.0.11
```

## Frontend Changes

### 1. Enhanced Disclosures Configuration

**Before (V1):**
```typescript
disclosures: {
  minimumAge: 18,
  excludedCountries: ['IRN', 'PRK'],
  ofac: true,
}
```

**After (V2):**
```typescript
disclosures: {
  minimumAge: 18,
  excludedCountries: ['IRN', 'PRK'],
  ofac: true,
  name: true,
  nationality: true,
  date_of_birth: true,
}
```

### 2. SelfAppBuilder Updates

The SelfAppBuilder now supports additional disclosure fields that provide more granular control over what data is requested from users.

**New Disclosure Fields:**
- `name`: Request user's full name
- `nationality`: Request user's nationality
- `date_of_birth`: Request date of birth (useful for age verification)

### 3. Files Updated

- `components/create/verification.tsx`: Updated SelfAppBuilder with v2 disclosures
- `components/task/taskclient.tsx`: Updated SelfAppBuilder with v2 disclosures

## Backend Changes

### 1. SelfBackendVerifier Initialization

**Before (V1):**
```typescript
const address = await getUserIdentifier(publicSignals, "hex");
```

**After (V2):**
```typescript
const verifier = new SelfBackendVerifier(
  "trustjudge-ai", // scope
  endpoint, // verification endpoint
  false, // mock mode
  [], // allowed document IDs
  null, // config storage
  UserIdType.HEX // user ID type
);

const verificationResult = await verifier.verifyProof(proof, publicSignals);
const address = verificationResult.userIdentifier;
```

### 2. Enhanced Verification

V2 provides more comprehensive verification with:
- Proper proof validation
- Error handling
- Result validation with `isValid` flag

### 3. Files Updated

- `app/api/verify/[taskId]/route.ts`: Updated to use SelfBackendVerifier v2

## Key Benefits of V2

1. **Better Security**: Enhanced proof verification and validation
2. **More Control**: Granular disclosure configuration
3. **Multi-Document Support**: Support for various ID types
4. **Improved Error Handling**: Better error messages and debugging
5. **Future-Proof**: Designed for extensibility

## Migration Checklist

- [x] Update dependencies to v2
- [x] Update frontend SelfAppBuilder configurations
- [x] Add new disclosure fields (name, nationality, date_of_birth)
- [x] Update backend verification logic
- [x] Replace getUserIdentifier with SelfBackendVerifier
- [x] Test frontend QR code generation
- [x] Test backend proof verification
- [ ] Test end-to-end verification flow

## Testing Instructions

### Frontend Testing

1. Navigate to the verification page
2. Configure verification options
3. Generate QR code
4. Verify the QR code contains proper v2 disclosure fields

### Backend Testing

1. Submit a proof to the verification endpoint
2. Verify the proof is processed using SelfBackendVerifier v2
3. Check that verification results are properly handled

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Ensure all imports are from the v2 packages
2. **Disclosure Field Errors**: Use correct field names (e.g., `date_of_birth` not `dateOfBirth`)
3. **Backend Verification Failures**: Ensure SelfBackendVerifier is properly initialized

### Debug Mode

To enable verbose logging:
```bash
DEBUG=self:* bun dev
```

## Environment Variables

No new environment variables are required for the v2 migration. The existing configuration works with v2.

## Rollback Plan

If issues arise, you can rollback to v1:

```bash
bun remove @selfxyz/core @selfxyz/qrcode
bun add @selfxyz/core@^0.0.23 @selfxyz/qrcode@^0.0.17
```

Then revert the code changes in the affected files.

## Support

- [Self Protocol V2 Documentation](https://docs.self.xyz/use-self/migration-v1-v2)
- [Self Protocol GitHub](https://github.com/self-id)