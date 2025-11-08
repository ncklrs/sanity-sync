# Project Structure

This document describes the structure and organization of the sanity-plugin-content-sync codebase.

## Directory Overview

```
sanity-plugin-content-sync/
├── src/                    # Source code
│   ├── api/               # API endpoint handlers
│   │   ├── client.ts      # Sanity client factory
│   │   ├── scan/          # Scan endpoint
│   │   ├── diff/          # Diff endpoint
│   │   ├── preview/       # Preview endpoint
│   │   ├── execute/       # Execute endpoint
│   │   ├── logs/          # Logs endpoint (placeholder)
│   │   ├── assets/        # Asset transfer (placeholder)
│   │   └── reconcile/     # Conflict resolution (placeholder)
│   │
│   ├── components/        # React UI components
│   │   ├── ContentSyncTool.tsx    # Main tool component
│   │   ├── Overview/              # Overview panel
│   │   ├── ScanDiff/              # Scan & diff panel
│   │   ├── Selection/             # Selection panel
│   │   ├── Preview/               # Preview & execute panel
│   │   ├── Logs/                  # Logs panel
│   │   └── Settings/              # Settings panel
│   │
│   ├── hooks/             # React hooks
│   │   └── useSyncState.ts       # State management hook
│   │
│   ├── lib/               # Core library code
│   │   ├── diff/          # Diff algorithms
│   │   │   ├── documentDiff.ts   # Document-level diff
│   │   │   ├── fieldDiff.ts      # Field-level diff
│   │   │   ├── conflictScore.ts  # Conflict scoring
│   │   │   ├── scanner.ts        # Dataset scanner
│   │   │   └── index.ts          # Exports
│   │   │
│   │   ├── merge/         # Merge policies
│   │   │   ├── patcher.ts        # Patch computation
│   │   │   └── policy.ts         # Policy implementation
│   │   │
│   │   ├── transaction/   # Transaction execution
│   │   │   └── executor.ts       # Sync executor
│   │   │
│   │   └── asset/         # Asset handling (placeholder)
│   │
│   ├── schemas/           # Sanity schemas
│   │   ├── syncJob.ts     # Sync job schema
│   │   ├── syncRule.ts    # Sync rule schema
│   │   └── index.ts       # Schema exports
│   │
│   ├── types/             # TypeScript types
│   │   ├── config.ts      # Configuration types
│   │   ├── sync.ts        # Sync operation types
│   │   ├── ui.ts          # UI component types
│   │   └── index.ts       # Type exports
│   │
│   ├── utils/             # Utility functions
│   │   ├── constants.ts   # Constants
│   │   ├── retry.ts       # Retry logic
│   │   └── sanitize.ts    # Data sanitization
│   │
│   ├── test/              # Test utilities
│   │   └── setup.ts       # Vitest setup
│   │
│   ├── plugin.tsx         # Plugin definition
│   └── index.ts           # Main entry point
│
├── examples/              # Usage examples
│   ├── basic-usage.ts     # Basic configuration
│   └── advanced-usage.ts  # Advanced with hooks
│
├── dist/                  # Build output (generated)
│
├── .eslintrc.cjs          # ESLint configuration
├── .gitignore             # Git ignore rules
├── .npmignore             # NPM ignore rules
├── .prettierrc            # Prettier configuration
├── .env.example           # Environment variables template
│
├── CHANGELOG.md           # Version history
├── CONTRIBUTING.md        # Contributing guidelines
├── LICENSE                # MIT license
├── README.md              # Project documentation
├── PROJECT_STRUCTURE.md   # This file
│
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript configuration
├── vitest.config.ts       # Vitest configuration
├── sanity.json            # Sanity plugin metadata
└── v2-incompatible.js     # V2 incompatibility marker
```

## Key Components

### Core Library (`src/lib/`)

**Diff Module:**
- `documentDiff.ts` - Compares two documents and produces a diff result
- `fieldDiff.ts` - Computes field-level differences
- `conflictScore.ts` - Calculates conflict severity scores
- `scanner.ts` - Scans datasets to find changes

**Merge Module:**
- `patcher.ts` - Generates patches from document diffs
- `policy.ts` - Implements merge policies (overwrite, preserve, smart merge, etc.)

**Transaction Module:**
- `executor.ts` - Executes sync operations with batching and retry logic

### API Layer (`src/api/`)

Server-side endpoint handlers that the UI calls:
- `scan/` - Scans and lists changes between datasets
- `diff/` - Computes field-level diff for a document
- `preview/` - Previews what would be synced
- `execute/` - Executes the sync operation

### UI Components (`src/components/`)

React components using Sanity UI:
- `ContentSyncTool.tsx` - Main tabbed interface
- Panel components for each workflow step

### Schemas (`src/schemas/`)

Sanity document schemas for:
- `syncJob` - Records of sync operations
- `syncRule` - Configurable sync rules

## Development Workflow

1. **Install dependencies**: `npm install`
2. **Type checking**: `npm run type-check`
3. **Linting**: `npm run lint`
4. **Testing**: `npm test`
5. **Build**: `npm run build`
6. **Watch mode**: `npm run watch`

## Architecture Principles

1. **Type Safety** - Comprehensive TypeScript types throughout
2. **Modularity** - Clear separation of concerns
3. **Testability** - Pure functions where possible
4. **Error Handling** - Retry logic with exponential backoff
5. **Performance** - Batched operations and pagination
6. **Security** - Token-based auth, data sanitization

## Extension Points

The plugin provides hooks for customization:
- `transformHook` - Transform documents before sync
- `assetTransformHook` - Control asset transfer
- `onJobStart` / `onJobComplete` - Lifecycle hooks

## Next Steps for Full Implementation

The current scaffold includes:
- ✅ Complete type system
- ✅ Diff and merge algorithms
- ✅ API endpoint structure
- ✅ Basic UI components
- ✅ Schema definitions

To complete the MVP, implement:
- [ ] Full UI interactions (selection, filtering)
- [ ] Asset transfer logic
- [ ] Logs panel with job history
- [ ] Settings panel with rule management
- [ ] Comprehensive tests
- [ ] Error boundary components
- [ ] Progress tracking and cancellation
