import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { Validator } from '../../src/core/validation/validator.js';
import { 
  ScenarioSchema, 
  RequirementSchema, 
  SpecSchema, 
  ChangeSchema,
  DeltaSchema 
} from '../../src/core/schemas/index.js';

describe('Validation Schemas', () => {
  describe('ScenarioSchema', () => {
    it('should validate a valid scenario', () => {
      const scenario = {
        rawText: 'Given a user is logged in\nWhen they click logout\nThen they are redirected to login page',
      };
      
      const result = ScenarioSchema.safeParse(scenario);
      expect(result.success).toBe(true);
    });

    it('should reject scenario with empty text', () => {
      const scenario = {
        rawText: '',
      };
      
      const result = ScenarioSchema.safeParse(scenario);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('场景文本不能为空');
      }
    });
  });

  describe('RequirementSchema', () => {
    it('should validate a valid requirement', () => {
      const requirement = {
        text: 'The system SHALL provide user authentication',
        scenarios: [
          {
            rawText: 'Given a user with valid credentials\nWhen they submit the login form\nThen they are authenticated',
          },
        ],
      };
      
      const result = RequirementSchema.safeParse(requirement);
      expect(result.success).toBe(true);
    });

    it('should reject requirement without SHALL or MUST', () => {
      const requirement = {
        text: 'The system provides user authentication',
        scenarios: [
          {
            rawText: 'Given a user\nWhen they login\nThen authenticated',
          },
        ],
      };
      
      const result = RequirementSchema.safeParse(requirement);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('需求必须包含 SHALL、MUST、必须或禁止关键字');
      }
    });

    it('should reject requirement without scenarios', () => {
      const requirement = {
        text: 'The system SHALL provide user authentication',
        scenarios: [],
      };
      
      const result = RequirementSchema.safeParse(requirement);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('需求必须至少有一个场景');
      }
    });
  });

  describe('SpecSchema', () => {
    it('should validate a valid spec', () => {
      const spec = {
        name: 'user-auth',
        overview: 'This spec defines user authentication requirements',
        requirements: [
          {
            text: 'The system SHALL provide user authentication',
            scenarios: [
              {
                rawText: 'Given a user with valid credentials\nWhen they submit the login form\nThen they are authenticated',
              },
            ],
          },
        ],
      };
      
      const result = SpecSchema.safeParse(spec);
      expect(result.success).toBe(true);
    });

    it('should reject spec without requirements', () => {
      const spec = {
        name: 'user-auth',
        overview: 'This spec defines user authentication requirements',
        requirements: [],
      };
      
      const result = SpecSchema.safeParse(spec);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('规范必须至少有一个需求');
      }
    });
  });

  describe('ChangeSchema', () => {
    it('should validate a valid change', () => {
      const change = {
        name: 'add-user-auth',
        why: 'We need user authentication to secure the application and protect user data',
        whatChanges: 'Add authentication module with login and logout capabilities',
        deltas: [
          {
            spec: 'user-auth',
            operation: 'ADDED',
            description: 'Add new user authentication spec',
          },
        ],
      };
      
      const result = ChangeSchema.safeParse(change);
      expect(result.success).toBe(true);
    });

    it('should reject change with short why section', () => {
      const change = {
        name: 'add-user-auth',
        why: 'Need auth',
        whatChanges: 'Add authentication',
        deltas: [
          {
            spec: 'user-auth',
            operation: 'ADDED',
            description: 'Add auth',
          },
        ],
      };
      
      const result = ChangeSchema.safeParse(change);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('为什么部分必须至少50个字符');
      }
    });

    it('should warn about too many deltas', () => {
      const deltas = Array.from({ length: 11 }, (_, i) => ({
        spec: `spec-${i}`,
        operation: 'ADDED' as const,
        description: `Add spec ${i}`,
      }));
      
      const change = {
        name: 'massive-change',
        why: 'This is a massive change that affects many parts of the system',
        whatChanges: 'Update everything',
        deltas,
      };
      
      const result = ChangeSchema.safeParse(change);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('考虑拆分包含超过10个增量的变更');
      }
    });
  });
});

describe('Validator', () => {
  const testDir = path.join(process.cwd(), 'test-validation-tmp');
  
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('validateSpec', () => {
    it('should validate a valid spec file', async () => {
      const specContent = `# User Authentication Spec

## Purpose
This specification defines the requirements for user authentication in the system.

## 需求

### The system SHALL provide secure user authentication
The system SHALL provide secure user authentication mechanisms.

#### Scenario: Successful login
Given a user with valid credentials
When they submit the login form
Then they are authenticated and redirected to the dashboard

### The system SHALL handle invalid login attempts
The system SHALL gracefully handle incorrect credentials.

#### Scenario: Invalid credentials
Given a user with invalid credentials
When they submit the login form
Then they see an error message`;

      const specPath = path.join(testDir, 'spec.md');
      await fs.writeFile(specPath, specContent);
      
      const validator = new Validator();
      const report = await validator.validateSpec(specPath);
      
      expect(report.valid).toBe(true);
      expect(report.summary.errors).toBe(0);
    });

    it('should detect missing overview section', async () => {
      const specContent = `# User Authentication Spec

## 需求

### The system SHALL provide secure user authentication

#### Scenario: Login
Given a user
When they login
Then authenticated`;

      const specPath = path.join(testDir, 'spec.md');
      await fs.writeFile(specPath, specContent);
      
      const validator = new Validator();
      const report = await validator.validateSpec(specPath);
      
      expect(report.valid).toBe(false);
      expect(report.summary.errors).toBeGreaterThan(0);
      expect(report.issues.some(i => i.message.includes('目的'))).toBe(true);
    });
  });

  describe('validateChange', () => {
    it('should validate a valid change file', async () => {
      const changeContent = `# Add User Authentication

## Why
We need to implement user authentication to secure the application and protect user data from unauthorized access.

## What Changes
- **user-auth:** Add new user authentication specification
- **api-endpoints:** Modify to include auth endpoints`;

      const changePath = path.join(testDir, 'change.md');
      await fs.writeFile(changePath, changeContent);
      
      const validator = new Validator();
      const report = await validator.validateChange(changePath);
      
      expect(report.valid).toBe(true);
      expect(report.summary.errors).toBe(0);
    });

    it('should detect missing why section', async () => {
      const changeContent = `# Add User Authentication

## What Changes
- **user-auth:** Add new user authentication specification`;

      const changePath = path.join(testDir, 'change.md');
      await fs.writeFile(changePath, changeContent);
      
      const validator = new Validator();
      const report = await validator.validateChange(changePath);
      
      expect(report.valid).toBe(false);
      expect(report.summary.errors).toBeGreaterThan(0);
      expect(report.issues.some(i => i.message.includes('为什么'))).toBe(true);
    });
  });

  describe('strict mode', () => {
    it('should fail on warnings in strict mode', async () => {
      const specContent = `# Test Spec

## Purpose
Brief overview

## 需求

### The system SHALL do something

#### Scenario: Test
Given test
When action
Then result`;

      const specPath = path.join(testDir, 'spec.md');
      await fs.writeFile(specPath, specContent);

      const validator = new Validator(true); // strict mode
      const report = await validator.validateSpec(specPath);

      expect(report.valid).toBe(false); // Should fail due to brief overview warning
    });

    it('should pass warnings in non-strict mode', async () => {
      const specContent = `# Test Spec

## Purpose
Brief overview

## 需求

### The system SHALL do something

#### Scenario: Test
Given test
When action
Then result`;

      const specPath = path.join(testDir, 'spec.md');
      await fs.writeFile(specPath, specContent);

      const validator = new Validator(false); // non-strict mode
      const report = await validator.validateSpec(specPath);

      expect(report.valid).toBe(true); // Should pass despite warnings
      expect(report.summary.warnings).toBeGreaterThan(0);
    });
  });

  describe('validateChangeDeltaSpecs with metadata', () => {
    it('should validate requirement with metadata before SHALL/MUST text', async () => {
      const changeDir = path.join(testDir, 'test-change');
      const specsDir = path.join(changeDir, 'specs', 'test-spec');
      await fs.mkdir(specsDir, { recursive: true });

      const deltaSpec = `# Test Spec

## 新增需求

### 需求: Circuit Breaker State Management SHALL be implemented
**ID**: REQ-CB-001
**Priority**: P1 (High)

The system MUST implement a circuit breaker with three states.

#### Scenario: Normal operation
**Given** the circuit breaker is in CLOSED state
**When** a request is made
**Then** the request is executed normally`;

      const specPath = path.join(specsDir, 'spec.md');
      await fs.writeFile(specPath, deltaSpec);

      const validator = new Validator(true);
      const report = await validator.validateChangeDeltaSpecs(changeDir);

      expect(report.valid).toBe(true);
      expect(report.summary.errors).toBe(0);
    });

    it('should validate requirement with SHALL in text but not in header', async () => {
      const changeDir = path.join(testDir, 'test-change-2');
      const specsDir = path.join(changeDir, 'specs', 'test-spec');
      await fs.mkdir(specsDir, { recursive: true });

      const deltaSpec = `# Test Spec

## 新增需求

### 需求: Error Handling
**ID**: REQ-ERR-001
**Priority**: P2

The system SHALL handle all errors gracefully.

#### Scenario: Error occurs
**Given** an error condition
**When** an error occurs
**Then** the error is logged and user is notified`;

      const specPath = path.join(specsDir, 'spec.md');
      await fs.writeFile(specPath, deltaSpec);

      const validator = new Validator(true);
      const report = await validator.validateChangeDeltaSpecs(changeDir);

      expect(report.valid).toBe(true);
      expect(report.summary.errors).toBe(0);
    });

    it('should fail when requirement text lacks SHALL/MUST', async () => {
      const changeDir = path.join(testDir, 'test-change-3');
      const specsDir = path.join(changeDir, 'specs', 'test-spec');
      await fs.mkdir(specsDir, { recursive: true });

      const deltaSpec = `# Test Spec

## 新增需求

### 需求: Logging Feature
**ID**: REQ-LOG-001

The system will log all events.

#### Scenario: Event occurs
**Given** an event
**When** it occurs
**Then** it is logged`;

      const specPath = path.join(specsDir, 'spec.md');
      await fs.writeFile(specPath, deltaSpec);

      const validator = new Validator(true);
      const report = await validator.validateChangeDeltaSpecs(changeDir);

      expect(report.valid).toBe(false);
      expect(report.summary.errors).toBeGreaterThan(0);
      expect(report.issues.some(i => i.message.includes('必须包含 SHALL、MUST、必须 或 禁止'))).toBe(true);
    });

    it('should handle requirements without metadata fields', async () => {
      const changeDir = path.join(testDir, 'test-change-4');
      const specsDir = path.join(changeDir, 'specs', 'test-spec');
      await fs.mkdir(specsDir, { recursive: true });

      const deltaSpec = `# Test Spec

## 新增需求

### 需求: Simple Feature
The system SHALL implement this feature.

#### Scenario: Basic usage
**Given** a condition
**When** an action occurs
**Then** a result happens`;

      const specPath = path.join(specsDir, 'spec.md');
      await fs.writeFile(specPath, deltaSpec);

      const validator = new Validator(true);
      const report = await validator.validateChangeDeltaSpecs(changeDir);

      expect(report.valid).toBe(true);
      expect(report.summary.errors).toBe(0);
    });

    it('should treat delta headers case-insensitively', async () => {
      const changeDir = path.join(testDir, 'test-change-mixed-case');
      const specsDir = path.join(changeDir, 'specs', 'test-spec');
      await fs.mkdir(specsDir, { recursive: true });

      const deltaSpec = `# Test Spec

## 新增需求

### 需求: Mixed Case Handling
The system MUST support mixed case delta headers.

#### Scenario: Case insensitive parsing
**Given** a delta file with mixed case headers
**When** validation runs
**Then** the delta is detected`;

      const specPath = path.join(specsDir, 'spec.md');
      await fs.writeFile(specPath, deltaSpec);

      const validator = new Validator(true);
      const report = await validator.validateChangeDeltaSpecs(changeDir);

      expect(report.valid).toBe(true);
      expect(report.summary.errors).toBe(0);
      expect(report.summary.warnings).toBe(0);
      expect(report.summary.info).toBe(0);
    });

    it('should validate spec-design-task traceability and task execution modes', async () => {
      const changeDir = path.join(testDir, 'test-change-trace');
      const specsDir = path.join(changeDir, 'specs', 'auth');
      await fs.mkdir(specsDir, { recursive: true });

      const deltaSpec = `# Auth Spec

## 新增需求

### 需求: Login validation
**Trace**: R1
The system SHALL reject malformed login requests before authentication.

#### 场景: Missing password
**Given** a login request without password
**When** validation runs
**Then** the request is rejected

### 需求: Session timeout
**Trace**: R2
The system MUST expire inactive sessions after timeout.

#### 场景: Inactive session expires
**Given** an inactive authenticated session
**When** the timeout window elapses
**Then** the session is invalidated`;

      const design = `## 上下文

Auth hardening.

## 目标 / 非目标

**目标：**
Cover validation and timeout.

**非目标：**
Do not redesign auth provider.

## 需求追踪

- [R1] -> [U1]
- [R2] -> [U2]

## 实施单元

### [U1] Login validation
- 关联需求: [R1]
- 模块边界: auth/controller
- 验证方式: request validation tests
- 知识沉淀: malformed request guard

### [U2] Session timeout
- 关联需求: [R2]
- 模块边界: auth/session
- 验证方式: timeout integration test
- 知识沉淀: timeout scheduling`;

      const tasks = `## 1. Validation

- [ ] 1.1 [R1][U1][test-first] 为登录参数校验添加失败测试
- [ ] 1.2 [R1][U1][test-first] 实现登录参数校验

## 2. Timeout

- [ ] 2.1 [R2][U2][characterization-first] 固化现有 session 超时行为
- [ ] 2.2 [R2][U2][test-first] 实现 session 超时失效逻辑`;

      await fs.writeFile(path.join(specsDir, 'spec.md'), deltaSpec);
      await fs.writeFile(path.join(changeDir, 'design.md'), design);
      await fs.writeFile(path.join(changeDir, 'tasks.md'), tasks);

      const validator = new Validator(true);
      const report = await validator.validateChangeDeltaSpecs(changeDir);

      expect(report.valid).toBe(true);
      expect(report.summary.errors).toBe(0);
      expect(report.summary.warnings).toBe(0);
    });

    it('should warn when traceability metadata or task execution modes are missing', async () => {
      const changeDir = path.join(testDir, 'test-change-missing-trace');
      const specsDir = path.join(changeDir, 'specs', 'auth');
      await fs.mkdir(specsDir, { recursive: true });

      const deltaSpec = `# Auth Spec

## 新增需求

### 需求: Login validation
The system SHALL reject malformed login requests before authentication.

#### 场景: Missing password
**Given** a login request without password
**When** validation runs
**Then** the request is rejected`;

      const design = `## 上下文

Auth hardening.`;

      const tasks = `## 1. Validation

- [ ] 1.1 实现登录参数校验`;

      await fs.writeFile(path.join(specsDir, 'spec.md'), deltaSpec);
      await fs.writeFile(path.join(changeDir, 'design.md'), design);
      await fs.writeFile(path.join(changeDir, 'tasks.md'), tasks);

      const validator = new Validator(false);
      const report = await validator.validateChangeDeltaSpecs(changeDir);

      expect(report.valid).toBe(true);
      expect(report.summary.warnings).toBeGreaterThan(0);
      expect(report.issues.some(i => i.message.includes('缺少 Trace ID'))).toBe(true);
      expect(report.issues.some(i => i.message.includes('缺少 `## 需求追踪` 章节'))).toBe(true);
      expect(report.issues.some(i => i.message.includes('缺少执行方式标签'))).toBe(true);
    });
  });
});
