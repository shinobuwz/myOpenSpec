import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  type SkillTemplate,
  getApplyChangeSkillTemplate,
  getArchiveChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getExploreSkillTemplate,
  getFfChangeSkillTemplate,
  getOpsxApplyCommandTemplate,
  getOpsxArchiveCommandTemplate,
  getOpsxContinueCommandTemplate,
  getOpsxExploreCommandTemplate,
  getOpsxFfCommandTemplate,
  getOpsxSyncCommandTemplate,
  getOpsxVerifyCommandTemplate,
  getSyncSpecsSkillTemplate,
  getVerifySkillTemplate,
} from '../../../src/core/templates/skill-templates.js';
import { generateSkillContent } from '../../../src/core/shared/skill-generation.js';

const EXPECTED_FUNCTION_HASHES: Record<string, string> = {
  getExploreSkillTemplate: '8da4e37d799cae6fa1f0b1fe8735618fbda8f7edc0910dde38462a7350eecccc',
  getContinueChangeSkillTemplate: '6a82cbb4d6f6d1a06c70cb4574e388137a929197dfad96acde01d00d38a5c0fc',
  getApplyChangeSkillTemplate: 'd4ee689b11883ea3de774609efbc5691cb8af27566b48038585beb594167b7db',
  getFfChangeSkillTemplate: 'bde1537c9c38575cecacd4afda21a5e9505511f9f7c7e4938337c81c4b238ae0',
  getSyncSpecsSkillTemplate: 'd3feac43baeca2a022d52fc388c4f869238430f4e2dcf5f1664d0b3f0837cf6c',
  getOpsxExploreCommandTemplate: '7b72f5fa4cc9369ad97adf170253c6facf215eed6274362d00456dd00adbc716',
  getOpsxContinueCommandTemplate: 'a16bdddc3e34e9e8e57a0e4f9f7597886c54ced7ef5ddccd4721d0a2ce7fb36b',
  getOpsxApplyCommandTemplate: '8a9375bc87023a730bd6423bfa03e083fb7f4b83af603b310ea489e4e5c1d833',
  getOpsxFfCommandTemplate: '6f1318ce59735757c29d2e11b1de4dacec6fee9fb2153a68e853461544716728',
  getArchiveChangeSkillTemplate: '912a43c7704650342e8512a6cf94c391867965de509106ce9dbab3e726d4d5da',
  getOpsxSyncCommandTemplate: 'fe13a808ce5d2f4fd8eb4054373ce8b02e9b097d562f4921caa591fc50e5cfae',
  getOpsxArchiveCommandTemplate: 'b9252b3909536e36aeb7b51585514b74e2e0a80cb6dd1b46d2f4b2b0c7c1a76f',
  getOpsxVerifyCommandTemplate: '9a2dc98a60e2674dc08bee127b26ba96517fc887cd3eea9284a16039cf8d4b54',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'openspec-explore': '3d8039c8a4035da46bc0603f20d7d28db9428cc6447e4a2846fd8c6aba4d3ae7',
  'openspec-continue-change': 'b8c9d09a5c27145680472ed51d355fb07ac194d4d63a6aaa8853b82c528546bd',
  'openspec-apply-change': 'c3d7aad8ccede31f6d654b18333c05633e523ebf2993839a58449ebeb4aa3c00',
  'openspec-ff-change': 'd7f0abd18a3f4ba82f9ec468e55bee0105003b0adf64e3337a88c586ca11301b',
  'openspec-sync-specs': 'f86649dbeee82332b787f92f3f4331bc4e2c445864f042aafd9bb7e6fb4cb266',
  'openspec-archive-change': '1df84252a83bac39fe281e1a24290357f797bf5384fdbfb255076f2b93a1cf2f',
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
      getContinueChangeSkillTemplate,
      getApplyChangeSkillTemplate,
      getFfChangeSkillTemplate,
      getSyncSpecsSkillTemplate,
      getOpsxExploreCommandTemplate,
      getOpsxContinueCommandTemplate,
      getOpsxApplyCommandTemplate,
      getOpsxFfCommandTemplate,
      getArchiveChangeSkillTemplate,
      getOpsxSyncCommandTemplate,
      getOpsxArchiveCommandTemplate,
      getOpsxVerifyCommandTemplate,
    };

    const actualHashes = Object.fromEntries(
      Object.entries(functionFactories).map(([name, fn]) => [name, hash(stableStringify(fn()))])
    );

    expect(actualHashes).toEqual(EXPECTED_FUNCTION_HASHES);
  });

  it('preserves generated skill file content exactly', () => {
    const skillFactories: Array<[string, () => SkillTemplate]> = [
      ['openspec-explore', getExploreSkillTemplate],
      ['openspec-continue-change', getContinueChangeSkillTemplate],
      ['openspec-apply-change', getApplyChangeSkillTemplate],
      ['openspec-ff-change', getFfChangeSkillTemplate],
      ['openspec-sync-specs', getSyncSpecsSkillTemplate],
      ['openspec-archive-change', getArchiveChangeSkillTemplate],
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
