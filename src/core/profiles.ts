/**
 * Profile System
 *
 * Defines workflow profiles that control which workflows are installed.
 * Profiles determine WHICH workflows; delivery (in global config) determines HOW.
 */

import type { Profile } from './global-config.js';

/**
 * Core workflows included in the 'core' profile.
 * These provide the full default workflow experience for new users.
 */
export const ALL_WORKFLOWS = [
  'propose',
  'explore',
  'bugfix',
  'knowledge',
  'new',
  'continue',
  'apply',
  'ff',
  'sync',
  'archive',
  'bulk-archive',
  'verify',
  'onboard',
  'bootstrap',
  'brainstorm',
  'plan',
  'plan-review',
  'tdd',
  'implement',
  'verify-enhanced',
  'review',
  'ship',
  'auto-drive',
] as const;

/**
 * Core workflows included in the 'core' profile.
 * The default profile installs the complete workflow set.
 */
export const CORE_WORKFLOWS = [...ALL_WORKFLOWS] as const;

export type WorkflowId = (typeof ALL_WORKFLOWS)[number];
export type CoreWorkflowId = (typeof CORE_WORKFLOWS)[number];

/**
 * Resolves which workflows should be active for a given profile configuration.
 *
 * - 'core' profile always returns CORE_WORKFLOWS
 * - 'custom' profile returns the provided customWorkflows, or empty array if not provided
 */
export function getProfileWorkflows(
  profile: Profile,
  customWorkflows?: string[]
): readonly string[] {
  if (profile === 'custom') {
    return customWorkflows ?? [];
  }
  return CORE_WORKFLOWS;
}
