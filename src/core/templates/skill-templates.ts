/**
 * Agent Skill Templates
 *
 * Compatibility facade that re-exports split workflow template modules.
 */

export type { SkillTemplate, CommandTemplate } from './types.js';

export { getExploreSkillTemplate, getOpsxExploreCommandTemplate } from './workflows/explore.js';
export { getBugfixSkillTemplate, getOpsxBugfixCommandTemplate } from './workflows/bugfix.js';
export { getKnowledgeSkillTemplate, getOpsxKnowledgeCommandTemplate } from './workflows/knowledge.js';
export { getContinueChangeSkillTemplate, getOpsxContinueCommandTemplate } from './workflows/continue-change.js';
export { getApplyChangeSkillTemplate, getOpsxApplyCommandTemplate } from './workflows/apply-change.js';
export { getFfChangeSkillTemplate, getOpsxFfCommandTemplate } from './workflows/ff-change.js';
export { getSyncSpecsSkillTemplate, getOpsxSyncCommandTemplate } from './workflows/sync-specs.js';
export { getArchiveChangeSkillTemplate, getOpsxArchiveCommandTemplate } from './workflows/archive-change.js';
export { getBootstrapSkillTemplate } from './workflows/bootstrap.js';
export { getPlanSkillTemplate } from './workflows/plan.js';
export { getTddSkillTemplate } from './workflows/tdd.js';
export { getImplementSkillTemplate } from './workflows/implement.js';
export { getVerifySkillTemplate, getOpsxVerifyCommandTemplate } from './workflows/verify.js';
export { getReviewSkillTemplate } from './workflows/review.js';
export { getPlanReviewSkillTemplate } from './workflows/plan-review.js';
export { getTaskAnalyzeSkillTemplate } from './workflows/task-analyze.js';
export { getAutoDriveSkillTemplate, getAutoDriveCommandTemplate } from './workflows/auto-drive.js';
