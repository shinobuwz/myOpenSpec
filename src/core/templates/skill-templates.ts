/**
 * Agent Skill Templates
 *
 * Compatibility facade that re-exports split workflow template modules.
 */

export type { SkillTemplate, CommandTemplate } from './types.js';

export { getExploreSkillTemplate, getOpsxExploreCommandTemplate } from './workflows/explore.js';
export { getNewChangeSkillTemplate, getOpsxNewCommandTemplate } from './workflows/new-change.js';
export { getContinueChangeSkillTemplate, getOpsxContinueCommandTemplate } from './workflows/continue-change.js';
export { getApplyChangeSkillTemplate, getOpsxApplyCommandTemplate } from './workflows/apply-change.js';
export { getFfChangeSkillTemplate, getOpsxFfCommandTemplate } from './workflows/ff-change.js';
export { getSyncSpecsSkillTemplate, getOpsxSyncCommandTemplate } from './workflows/sync-specs.js';
export { getArchiveChangeSkillTemplate, getOpsxArchiveCommandTemplate } from './workflows/archive-change.js';
export { getBulkArchiveChangeSkillTemplate, getOpsxBulkArchiveCommandTemplate } from './workflows/bulk-archive-change.js';
export { getVerifyChangeSkillTemplate, getOpsxVerifyCommandTemplate } from './workflows/verify-change.js';
export { getOnboardSkillTemplate, getOpsxOnboardCommandTemplate } from './workflows/onboard.js';
export { getOpsxProposeSkillTemplate, getOpsxProposeCommandTemplate } from './workflows/propose.js';
export { getFeedbackSkillTemplate } from './workflows/feedback.js';
export { getBootstrapSkillTemplate } from './workflows/bootstrap.js';
export { getBrainstormSkillTemplate } from './workflows/brainstorm.js';
export { getPlanSkillTemplate } from './workflows/plan.js';
export { getTddSkillTemplate } from './workflows/tdd.js';
export { getImplementSkillTemplate } from './workflows/implement.js';
export { getVerifySkillTemplate } from './workflows/verify.js';
export { getReviewSkillTemplate } from './workflows/review.js';
export { getShipSkillTemplate } from './workflows/ship.js';
export { getPlanReviewSkillTemplate } from './workflows/plan-review.js';
export { getAutoDriveSkillTemplate, getAutoDriveCommandTemplate } from './workflows/auto-drive.js';
