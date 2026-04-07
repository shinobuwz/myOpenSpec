import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  type SkillTemplate,
  getApplyChangeSkillTemplate,
  getArchiveChangeSkillTemplate,
  getBulkArchiveChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getExploreSkillTemplate,
  getFeedbackSkillTemplate,
  getFfChangeSkillTemplate,
  getNewChangeSkillTemplate,
  getOnboardSkillTemplate,
  getOpsxApplyCommandTemplate,
  getOpsxArchiveCommandTemplate,
  getOpsxBulkArchiveCommandTemplate,
  getOpsxContinueCommandTemplate,
  getOpsxExploreCommandTemplate,
  getOpsxFfCommandTemplate,
  getOpsxNewCommandTemplate,
  getOpsxOnboardCommandTemplate,
  getOpsxSyncCommandTemplate,
  getOpsxVerifyCommandTemplate,
  getSyncSpecsSkillTemplate,
  getVerifyChangeSkillTemplate,
} from '../../../src/core/templates/skill-templates.js';
import { generateSkillContent } from '../../../src/core/shared/skill-generation.js';

const EXPECTED_FUNCTION_HASHES: Record<string, string> = {
  getExploreSkillTemplate: 'dbfcd5c7559e3cfa30d6e8ac27a518d8f5ef3371938b425f1f704cc5799c57f3',
  getNewChangeSkillTemplate: '61221375d50775da0a045f56d11cea1e04ed4822a84ef738342bacc481397055',
  getContinueChangeSkillTemplate: 'ade24da033eecf69174d701ee8f78c27de0d7c7ed136de620e4d7a2536ac58bf',
  getApplyChangeSkillTemplate: 'd4ee689b11883ea3de774609efbc5691cb8af27566b48038585beb594167b7db',
  getFfChangeSkillTemplate: 'c162148320fae50e67a07c3d42ca76dd189943d239fb71501f71c1d7aa51bd81',
  getSyncSpecsSkillTemplate: 'd3feac43baeca2a022d52fc388c4f869238430f4e2dcf5f1664d0b3f0837cf6c',
  getOnboardSkillTemplate: '7de26557bd13fd3f5825f19965e4a4b2dbdee84a512901d90d023efa4d0ffa08',
  getOpsxExploreCommandTemplate: 'ecaa35a710067ccac895caeab7f01193a51ba6d55e3bf3b82ab62d5e5396163f',
  getOpsxNewCommandTemplate: '34c75c2db33077faa5b571f485cef63b3fa61867eb0e9d93229aca00a3370443',
  getOpsxContinueCommandTemplate: 'a7d4680c7378cc389a3ef1d700c7f4d21d74e55dc498d20acb11e6af145324ee',
  getOpsxApplyCommandTemplate: '8a9375bc87023a730bd6423bfa03e083fb7f4b83af603b310ea489e4e5c1d833',
  getOpsxFfCommandTemplate: 'dc63cea6ed71c9cb3e5a7fc29a2df2054f2769ae1db69cf619d68fa368d61873',
  getArchiveChangeSkillTemplate: 'fdf1137927fbb98cbf694f68774c0c2c72dddab4a3d6e511deca559266fef2cd',
  getBulkArchiveChangeSkillTemplate: '4730cd7fa0e148ecc72fca66ab92ad7bb4d8842aa4a53262d59caeeea3b22557',
  getOpsxSyncCommandTemplate: 'fe13a808ce5d2f4fd8eb4054373ce8b02e9b097d562f4921caa591fc50e5cfae',
  getVerifyChangeSkillTemplate: '2575640303b9d80d4014df0b1a122b06112f7f1cea1b87005955c22d9e1dec6b',
  getOpsxArchiveCommandTemplate: '4aa12d9ba5bbc48b98109a178f418225b61aab83fd7c74a2702a3dae3c31384a',
  getOpsxOnboardCommandTemplate: '8870740aa2ef6e1cea284397ebec1fc4c265f7045d09940e44d7419522388f34',
  getOpsxBulkArchiveCommandTemplate: 'ccc72708fa5afc926cf892e622566d572c7edc5297149c6b5efe7c147e1d9a8f',
  getOpsxVerifyCommandTemplate: 'c76ceec0342daf6ca5a02053890edf912c56d4e5a370c7b67c67656bb8f9277f',
  getFeedbackSkillTemplate: 'baef27109af3f62c066fd19dda6f5022fe6af77101bd5e3617ca27c48dac5953',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'openspec-explore': 'f9839fcb597fd0165f0db41e5f0aadd721d53e8ed070b089ca1ef38bfa20f2a6',
  'openspec-new-change': 'bafb1b1a364a373ad23412df19b012e678e49981820fccb270c15df59add387f',
  'openspec-continue-change': '899ca759c2fd3906c1f792bf7c993b4376ddc64caba93f597ec1da2ce323e42e',
  'openspec-apply-change': 'c3d7aad8ccede31f6d654b18333c05633e523ebf2993839a58449ebeb4aa3c00',
  'openspec-ff-change': '38848e4497b9010cf36505508f7899e74e0e265342268ca1418ef6571fda27df',
  'openspec-sync-specs': 'f86649dbeee82332b787f92f3f4331bc4e2c445864f042aafd9bb7e6fb4cb266',
  'openspec-archive-change': 'ba62e3e1c5fef2c0da74ddbe6c061f3a6e6158e786f561c1c0bd5d24e1294989',
  'openspec-bulk-archive-change': 'f9a31fd8b54c26a709a86e49d619b43d71ecc6aa3d09983a1a5bbcc0a568418c',
  'openspec-verify-change': 'a77449de493030de4fc751a580502e2b582fbe1a7d091b18ff95d3d764e69109',
  'openspec-onboard': '63c1feeea6488aa19c474f55e3614a76e86859c280aa3ba25493f05bc853a7cd',
};

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);

    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value);
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('skill templates split parity', () => {
  it('preserves all template function payloads exactly', () => {
    const functionFactories: Record<string, () => unknown> = {
      getExploreSkillTemplate,
      getNewChangeSkillTemplate,
      getContinueChangeSkillTemplate,
      getApplyChangeSkillTemplate,
      getFfChangeSkillTemplate,
      getSyncSpecsSkillTemplate,
      getOnboardSkillTemplate,
      getOpsxExploreCommandTemplate,
      getOpsxNewCommandTemplate,
      getOpsxContinueCommandTemplate,
      getOpsxApplyCommandTemplate,
      getOpsxFfCommandTemplate,
      getArchiveChangeSkillTemplate,
      getBulkArchiveChangeSkillTemplate,
      getOpsxSyncCommandTemplate,
      getVerifyChangeSkillTemplate,
      getOpsxArchiveCommandTemplate,
      getOpsxOnboardCommandTemplate,
      getOpsxBulkArchiveCommandTemplate,
      getOpsxVerifyCommandTemplate,
      getFeedbackSkillTemplate,
    };

    const actualHashes = Object.fromEntries(
      Object.entries(functionFactories).map(([name, fn]) => [name, hash(stableStringify(fn()))])
    );

    expect(actualHashes).toEqual(EXPECTED_FUNCTION_HASHES);
  });

  it('preserves generated skill file content exactly', () => {
    // Intentionally excludes getFeedbackSkillTemplate: skillFactories only models templates
    // deployed via generateSkillContent, while feedback is covered in function payload parity.
    const skillFactories: Array<[string, () => SkillTemplate]> = [
      ['openspec-explore', getExploreSkillTemplate],
      ['openspec-new-change', getNewChangeSkillTemplate],
      ['openspec-continue-change', getContinueChangeSkillTemplate],
      ['openspec-apply-change', getApplyChangeSkillTemplate],
      ['openspec-ff-change', getFfChangeSkillTemplate],
      ['openspec-sync-specs', getSyncSpecsSkillTemplate],
      ['openspec-archive-change', getArchiveChangeSkillTemplate],
      ['openspec-bulk-archive-change', getBulkArchiveChangeSkillTemplate],
      ['openspec-verify-change', getVerifyChangeSkillTemplate],
      ['openspec-onboard', getOnboardSkillTemplate],
    ];

    const actualHashes = Object.fromEntries(
      skillFactories.map(([dirName, createTemplate]) => [
        dirName,
        hash(generateSkillContent(createTemplate(), 'PARITY-BASELINE')),
      ])
    );

    expect(actualHashes).toEqual(EXPECTED_GENERATED_SKILL_CONTENT_HASHES);
  });
});
