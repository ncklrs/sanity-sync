# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**sanity-plugin-content-sync** is a Sanity Studio v3+ plugin for selective, field-level content synchronization between datasets. Think Git for Sanity content - scan changes, review diffs, choose merge strategies, and sync with full audit trails.

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Type checking (always run before committing)
npm run type-check

# Linting
npm run lint

# Run tests
npm test

# Run tests with coverage
npm test:coverage

# Build the plugin
npm run build

# Clean build artifacts
npm run clean

# Watch mode for development
npm run watch

# Format code
npm run format
```

### Testing
- Uses Vitest with jsdom environment
- Test files: `src/lib/**/*.test.ts`
- Setup file: `src/test/setup.ts`
- Run specific test: `npx vitest run src/lib/diff/documentDiff.test.ts`

## Architecture

### Core Philosophy
The plugin separates concerns into three layers:
1. **UI Layer** (`src/components/`) - React components using Sanity UI
2. **Logic Layer** (`src/lib/`) - Pure TypeScript algorithms (diff, merge, asset transfer)
3. **API Layer** (`src/api/`) - Endpoint handlers for UI-to-logic communication

### Critical Data Flow
```
User Action → UI Component → useSyncState Hook → API Handler → Core Library → Sanity Client
```

### Key Modules

**Diff Module** (`src/lib/diff/`)
- `documentDiff.ts` - Compares documents, produces diff results
- `fieldDiff.ts` - Field-level comparison with path tracking
- `conflictScore.ts` - Conflict severity scoring (0-100)
- `scanner.ts` - GROQ-based dataset scanning with pagination

**Merge Module** (`src/lib/merge/`)
- `policy.ts` - 4 merge policies:
  - `overwrite`: Source wins for all fields
  - `merge_preserve`: Keep specific target fields (uses `preserveHintFields` config)
  - `preserve_target_if_newer`: Keep target if `_updatedAt` is newer
  - `smart_merge`: Intelligent array/reference merging with deduplication
- `patcher.ts` - Generates Sanity transaction patches from diffs

**Asset Module** (`src/lib/asset/`)
- `transfer.ts` - Asset transfer with SHA1 deduplication
  - `findAssetReferences()`: Recursively finds all image/file refs
  - `transferAssets()`: Bulk transfer with options
  - `remapAssetReferences()`: Updates doc refs after transfer

**Transaction Module** (`src/lib/transaction/`)
- `executor.ts` - Batched sync execution with retry logic
  - Respects `batchSize` (default: 50) and `concurrency` (default: 4)
  - Uses exponential backoff for retries

### State Management
Single source of truth in `useSyncState` hook ([src/hooks/useSyncState.ts](src/hooks/useSyncState.ts)):
- Source/target dataset selection
- Scan results and filters
- Document selection state
- Sync policy and options
- Job tracking and logs

### UI Component Structure
Main tool: `ContentSyncTool.tsx` - tabbed interface with 6 panels:
1. **Overview** - Dataset selection
2. **Scan & Diff** - Change detection with `FilterControls`, `ChangeList`, `DiffViewer`
3. **Selection** - Bulk selection with policy dropdown
4. **Preview & Execute** - Dry-run and execution with progress tracking
5. **Logs** - Job history with `JobDetails` modal
6. **Settings** - Config display and sync rule CRUD with `RuleEditor`

## Type System

### Primary Types
- `ContentSyncConfig` - Plugin configuration
- `SyncJobRecord` - Job audit trail (stored as Sanity document)
- `SyncRuleRecord` - Sync rules (stored as Sanity document)
- `DiffResult` - Field-level diff output
- `ChangeRecord` - Individual document change
- `SyncPolicy` - Merge strategy enum

### Important Type Locations
- Configuration: [src/types/config.ts](src/types/config.ts)
- Sync operations: [src/types/sync.ts](src/types/sync.ts)
- UI components: [src/types/ui.ts](src/types/ui.ts)

## Environment Setup

Required environment variables (see [.env.example](.env.example)):
```bash
SANITY_SYNC_READ_TOKEN=sk-...
SANITY_SYNC_WRITE_TOKEN=sk-...
```

Generate tokens at [sanity.io/manage](https://sanity.io/manage) with:
- Read token: Reader access to source datasets
- Write token: Editor/Admin access to target datasets

## Plugin Configuration

Plugin is registered via `definePlugin()` in [src/plugin.tsx](src/plugin.tsx). Default config:
```typescript
{
  datasets: [],                      // Must be provided by user
  readTokenEnv: 'SANITY_SYNC_READ_TOKEN',
  writeTokenEnv: 'SANITY_SYNC_WRITE_TOKEN',
  preserveHintFields: ['_keepLocal', 'devOnly', 'testMeta'],
  batchSize: 50,
  concurrency: 4,
}
```

## Sanity-Specific Patterns

### Client Creation
Use `createClient()` from `src/api/client.ts` - handles token injection from env vars.

### Document Schemas
Two system schemas in [src/schemas/](src/schemas/):
- `syncJob` - Audit trail of sync operations
- `syncRule` - User-defined sync rules

### GROQ Queries
Scanner uses `*[_type in $types] | order(_updatedAt desc)` pattern with pagination via `[start...end]` slice syntax.

### Transaction Safety
All writes use Sanity transactions for atomicity:
```typescript
transaction
  .createOrReplace(doc)
  .patch(docId, patches)
  .commit({ visibility: 'sync', returnDocuments: false })
```

## Testing Philosophy

Tests focus on pure algorithmic correctness:
- **documentDiff.test.ts** - Identity and diff computation
- **fieldDiff.test.ts** - Field-level change detection
- **policy.test.ts** - All 4 merge policies
- **transfer.test.ts** - Asset reference finding and remapping
- **retry.test.ts** - Exponential backoff and retryable errors

Use mocks (`vi.fn()`) for Sanity clients. Test files are excluded from builds.

## Build System

- **Bundler**: `@sanity/pkg-utils` (dual CJS/ESM output)
- **Entry**: `src/index.ts`
- **Output**: `dist/index.js` (CJS), `dist/index.esm.js` (ESM)
- **Types**: `dist/index.d.ts` with source maps
- **Plugin verification**: `plugin-kit verify-package` runs on build

### Package Exports
```json
{
  ".": {
    "types": "./dist/index.d.ts",
    "require": "./dist/index.js",
    "import": "./dist/index.esm.js",
    "default": "./dist/index.esm.js"
  }
}
```

## TypeScript Configuration

Strict mode enabled with:
- `noUnusedLocals`, `noUnusedParameters`
- `noImplicitReturns`
- `noFallthroughCasesInSwitch`

Root: `./src`, Output: `./dist`, Excludes test files from declarations.

## Current State

This is a **completed MVP** (see [MVP_COMPLETION.md](MVP_COMPLETION.md)):
- All 6 UI panels fully implemented
- Core algorithms complete with tests
- Asset transfer system ready
- Mock data for UI development
- ~4,600 lines of TypeScript/TSX

### Next Integration Steps
The UI uses mock data. To complete integration:
1. Wire API handlers in `src/api/` to actual Sanity clients
2. Replace mock responses in UI panels with real API calls
3. Test with production datasets (10k+ documents)
4. Implement cancellation and advanced progress tracking

## Gotchas

1. **Asset SHA1 Deduplication**: The plugin checks `sha1hash` before copying assets. If target already has the asset, it links instead of copying.

2. **Preserve Hint Fields**: Fields listed in `preserveHintFields` config are automatically preserved in `merge_preserve` policy, even if not explicitly in `preserveFields` array.

3. **Conflict Scoring**: Scores >50 indicate high conflict. Algorithm considers field count, nesting depth, and whether both sides modified system fields.

4. **GROQ Pagination**: Scanner fetches in batches (default 100). Large datasets (>10k docs) will make multiple queries.

5. **Retry Logic**: Only network errors and rate limits are retryable. Auth, conflict, and schema errors fail immediately.

6. **Plugin Name**: Internal name is `sanity-plugin-content-sync`, tool name is `content-sync`.

## File References

When working with this codebase, key files to understand:
- Plugin entry: [src/plugin.tsx](src/plugin.tsx)
- Main UI: [src/components/ContentSyncTool.tsx](src/components/ContentSyncTool.tsx)
- State hook: [src/hooks/useSyncState.ts](src/hooks/useSyncState.ts)
- Diff engine: [src/lib/diff/documentDiff.ts](src/lib/diff/documentDiff.ts)
- Merge policies: [src/lib/merge/policy.ts](src/lib/merge/policy.ts)
- Asset transfer: [src/lib/asset/transfer.ts](src/lib/asset/transfer.ts)
- Sync executor: [src/lib/transaction/executor.ts](src/lib/transaction/executor.ts)

## Compatibility

- Sanity Studio: v3.0+ (uses `definePlugin` API)
- Node.js: >=18
- React: ^18
- TypeScript: ^5.4
