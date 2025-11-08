# sanity-plugin-content-sync

> One-click selective sync between Sanity datasets with field-level diff and merge control

[![npm version](https://img.shields.io/npm/v/sanity-plugin-content-sync.svg?style=flat-square)](https://www.npmjs.com/package/sanity-plugin-content-sync)

## Features

- 🔄 **Selective Sync** - Choose exactly which documents to sync between datasets
- 🔍 **Field-level Diffs** - See exactly what changed, field by field
- 🛡️ **Preserve Dev Changes** - Protect intentional dev-only content when syncing
- 📦 **Asset Transfer** - Automatically handle asset dependencies
- 🔒 **Safe & Secure** - Dry-run mode, transactional writes, and audit logs
- ⚡ **Production Ready** - Battle-tested algorithms with rate limiting and retry logic

## Installation

```bash
npm install sanity-plugin-content-sync
# or
yarn add sanity-plugin-content-sync
# or
pnpm add sanity-plugin-content-sync
```

## Usage

Add it as a plugin in `sanity.config.ts` (or .js):

```ts
import {defineConfig} from 'sanity'
import {contentSync} from 'sanity-plugin-content-sync'

export default defineConfig({
  //...
  plugins: [
    contentSync({
      datasets: [
        {id: 'dev', label: 'Development', projectId: 'your-project-id'},
        {id: 'staging', label: 'Staging', projectId: 'your-project-id'},
        {id: 'prod', label: 'Production', projectId: 'your-project-id'},
      ],
      defaultSource: 'staging',
      defaultTarget: 'prod',
      readTokenEnv: 'SANITY_SYNC_READ_TOKEN',
      writeTokenEnv: 'SANITY_SYNC_WRITE_TOKEN',
    }),
  ],
})
```

## Configuration

### Environment Variables

The plugin requires API tokens to access your datasets:

```bash
SANITY_SYNC_READ_TOKEN=your-read-token
SANITY_SYNC_WRITE_TOKEN=your-write-token
```

Generate tokens at [sanity.io/manage](https://sanity.io/manage)

### Plugin Options

| Option | Type | Description |
|--------|------|-------------|
| `datasets` | `DatasetConfig[]` | Array of dataset configurations |
| `defaultSource` | `string` | Default source dataset ID |
| `defaultTarget` | `string` | Default target dataset ID |
| `readTokenEnv` | `string` | Environment variable name for read token |
| `writeTokenEnv` | `string` | Environment variable name for write token |
| `preserveHintFields` | `string[]` | Field names that indicate content should be preserved |

## Workflow

1. **Select Datasets** - Choose source and target datasets
2. **Scan Changes** - Plugin compares datasets and shows differences
3. **Review Diffs** - See field-level changes for each document
4. **Choose Policy** - Select merge strategy (overwrite, preserve, merge)
5. **Preview** - Run dry-run to see what will change
6. **Execute** - Apply changes with transactional safety
7. **Review Logs** - Check detailed operation logs

## Merge Policies

- **Overwrite** - Source wins for all fields
- **Merge & Preserve** - Keep specific fields from target
- **Preserve if Newer** - Keep target field if it's more recent
- **Smart Merge** - Union arrays and references with deduplication

## Development

```bash
# Install dependencies
npm install

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm test

# Build plugin
npm run build
```

## License

MIT © [Your Name]

## Compatibility

- Sanity Studio v3 and v4
- Node.js >= 18
