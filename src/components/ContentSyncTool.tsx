/**
 * Main Content Sync Tool component
 */

import { useState } from 'react'
import { Card, Container, Flex, Tab, TabList, TabPanel } from '@sanity/ui'
import type { ContentSyncConfig } from '../types'
import { OverviewPanel } from './Overview/OverviewPanel'
import { ScanDiffPanel } from './ScanDiff/ScanDiffPanel'
import { SelectionPanel } from './Selection/SelectionPanel'
import { PreviewPanel } from './Preview/PreviewPanel'
import { LogsPanel } from './Logs/LogsPanel'
import { SettingsPanel } from './Settings/SettingsPanel'
import { useSyncState } from '../hooks/useSyncState'

export interface ContentSyncToolProps {
  config: ContentSyncConfig
}

export function ContentSyncTool({ config }: ContentSyncToolProps) {
  const [activeTab, setActiveTab] = useState<string>('overview')
  const syncState = useSyncState(config)

  return (
    <Container width={5} padding={4}>
      <Card>
        <Flex direction="column" gap={4}>
          <TabList space={2}>
            <Tab
              aria-controls="overview-panel"
              id="overview-tab"
              label="Overview"
              selected={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <Tab
              aria-controls="scan-panel"
              id="scan-tab"
              label="Scan & Diff"
              selected={activeTab === 'scan'}
              onClick={() => setActiveTab('scan')}
            />
            <Tab
              aria-controls="selection-panel"
              id="selection-tab"
              label="Selection"
              selected={activeTab === 'selection'}
              onClick={() => setActiveTab('selection')}
            />
            <Tab
              aria-controls="preview-panel"
              id="preview-tab"
              label="Preview & Execute"
              selected={activeTab === 'preview'}
              onClick={() => setActiveTab('preview')}
            />
            <Tab
              aria-controls="logs-panel"
              id="logs-tab"
              label="Logs"
              selected={activeTab === 'logs'}
              onClick={() => setActiveTab('logs')}
            />
            <Tab
              aria-controls="settings-panel"
              id="settings-tab"
              label="Settings"
              selected={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            />
          </TabList>

          <TabPanel aria-labelledby="overview-tab" hidden={activeTab !== 'overview'} id="overview-panel">
            <OverviewPanel config={config} syncState={syncState} />
          </TabPanel>

          <TabPanel aria-labelledby="scan-tab" hidden={activeTab !== 'scan'} id="scan-panel">
            <ScanDiffPanel syncState={syncState} />
          </TabPanel>

          <TabPanel aria-labelledby="selection-tab" hidden={activeTab !== 'selection'} id="selection-panel">
            <SelectionPanel syncState={syncState} />
          </TabPanel>

          <TabPanel aria-labelledby="preview-tab" hidden={activeTab !== 'preview'} id="preview-panel">
            <PreviewPanel syncState={syncState} />
          </TabPanel>

          <TabPanel aria-labelledby="logs-tab" hidden={activeTab !== 'logs'} id="logs-panel">
            <LogsPanel />
          </TabPanel>

          <TabPanel aria-labelledby="settings-tab" hidden={activeTab !== 'settings'} id="settings-panel">
            <SettingsPanel config={config} />
          </TabPanel>
        </Flex>
      </Card>
    </Container>
  )
}
