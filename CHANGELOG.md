# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial implementation of content sync plugin
- Dataset scanning and comparison
- Field-level diff viewer
- Multiple merge policies (overwrite, merge_preserve, preserve_if_newer, smart_merge)
- Sync rule system for preserving dev-only content
- Dry-run mode for safe previewing
- Transaction-based sync with retry logic
- Comprehensive TypeScript types
- Basic UI components for all panels
- Audit logging with syncJob schema

### Features
- Scan changes between datasets
- View field-level diffs
- Select documents to sync
- Preview changes before applying
- Execute sync with various merge policies
- View sync history and logs
- Configure sync rules

## [0.1.0] - TBD

Initial release
