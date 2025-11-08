/**
 * Export all schemas for the plugin
 */

import { syncJob } from './syncJob'
import { syncRule } from './syncRule'

export const schemas = [syncJob, syncRule]

export { syncJob, syncRule }
