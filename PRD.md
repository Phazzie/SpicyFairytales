# DarkStory Generator - Enhanced PRD with Seam-Driven Development

## 📋 **EXECUTIVE SUMMARY**

**Product:** DarkStory Generator - AI-Powered Interactive Storytelling Platform  
**Version:** 2.1 (Seam-Driven Clean Architecture Edition)  
**Date:** September 11, 2025  
**Status:** Enhanced Design Phase

This enhanced PRD incorporates **Seam-Driven Development (SDD)** methodology with the original clean architecture foundation. SDD emphasizes designing around boundaries (seams) with strict contracts, enabling true modularity, extreme testability, and maintainability.

---

## ⚙️ Angular Implementation Addendum

This PRD is technology-agnostic by design, but our implementation is Angular 20 with standalone components. Where examples reference "React components" in the presentation layer, read as "Angular standalone components". Key Angular mappings:

- Presentation: Angular standalone components + signals/RxJS; routes in `app.routes.ts`.
- Application: Injectable services/facades orchestrating flows; DI via `InjectionToken`s per seam.
- Domain: Contracts/interfaces under `src/app/shared/contracts.ts`.
- Infrastructure: HTTP services using `HttpClient` or `fetch` for streaming; interceptors for auth/retry.

Seam DI tokens (examples): `STORY_SERVICE`, `SPEAKER_PARSER`, `VOICE_SERVICE`. Provide mocks when `USE_MOCKS=true` via `app.config.ts` providers.

Testing: TestBed for services/components, marble tests for streams, optional Playwright/Cypress for e2e.

This addendum aligns the PRD’s abstract layers and contracts with our Angular codebase without altering the product scope.

---

## 🏗️ **ENHANCED ARCHITECTURE: Seam-Driven Clean Architecture**

### **Seam-Driven Development (SDD) Integration**

**What is SDD?**
SDD is an architectural approach where you design applications around their boundaries, or "seams." A **seam** is a point of contact between a module and its dependencies. The interaction across a seam is governed by a strict **contract** - formal definitions of data structures and function signatures.

**Why SDD Enhances Our Design:**
- **True Modularity:** AI providers can be swapped by changing one file without touching UI code
- **Extreme Testability:** UI components tested in complete isolation using seam mocks
- **Maintainability:** Clear separation of concerns makes codebase easy to understand, debug, and extend

### **Standard Contract Pattern**

#### **Base Service Contract Interface**
All service contracts must implement a standard base interface to ensure consistency and enable common functionality like health checks, configuration validation, and error handling.

```typescript
// types/baseContract.ts
export interface BaseServiceContract {
  readonly serviceName: string
  readonly version: string
  
  // Health and status
  healthCheck(): Promise<ServiceHealth>
  getCapabilities(): ServiceCapabilities
  
  // Configuration
  validateConfiguration(): Promise<ValidationResult>
  getConfiguration(): ServiceConfiguration
  
  // Lifecycle
  initialize(): Promise<void>
  dispose(): Promise<void>
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: Date
  checks: HealthCheck[]
}

export interface ServiceCapabilities {
  supportedOperations: string[]
  limitations: string[]
  metadata: Record<string, any>
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}
```

#### **Standard Error Contract**
All services must use a standardized error format for consistent error handling across the application.

```typescript
// types/errorContract.ts
export interface ServiceError {
  code: ErrorCode
  message: string
  details?: Record<string, any>
  timestamp: Date
  service: string
  operation: string
  recoverable: boolean
  retryAfter?: number
}

export enum ErrorCode {
  // Standard error codes
  INVALID_INPUT = 'INVALID_INPUT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT'
}
```

#### **Standard Result Contract**
All service operations must return results in a standardized format.

```typescript
// types/resultContract.ts
export interface ServiceResult<T = any> {
  success: boolean
  data?: T
  error?: ServiceError
  metadata: ResultMetadata
}

export interface ResultMetadata {
  timestamp: Date
  duration: number
  service: string
  operation: string
  requestId: string
  version: string
}

export interface PaginatedResult<T> extends ServiceResult<T[]> {
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}
```

#### **Standard Streaming Contract**
For streaming operations, all services must follow a consistent streaming pattern.

```typescript
// types/streamingContract.ts
export interface StreamChunk<T = any> {
  type: 'data' | 'error' | 'complete' | 'progress'
  data?: T
  error?: ServiceError
  progress?: StreamProgress
  metadata: StreamMetadata
}

export interface StreamProgress {
  current: number
  total: number
  percentage: number
  message?: string
}

export interface StreamMetadata {
  streamId: string
  timestamp: Date
  sequence: number
}

export interface StreamingService<T = any> {
  createStream(operation: string, options: any): Promise<AsyncGenerator<StreamChunk<T>>>
  cancelStream(streamId: string): Promise<void>
  getStreamStatus(streamId: string): Promise<StreamStatus>
}
```

### **Contract Implementation Standards**

#### **1. Naming Conventions**
```typescript
// ✅ Good: Clear, descriptive names
export interface AIStoryGenerationService {
  generateStory(options: StoryOptions): Promise<StoryResult>
}

// ❌ Bad: Unclear or generic names
export interface Service {
  doSomething(options: any): Promise<any>
}
```

#### **2. Parameter Validation**
All contract implementations must validate inputs according to the contract specifications.

```typescript
export class AIStoryService implements AIStoryServiceContract {
  async generateStory(options: StoryOptions): Promise<StoryResult> {
    // Validate input against contract
    const validation = this.validateOptions(options)
    if (!validation.valid) {
      throw new ServiceError({
        code: ErrorCode.INVALID_INPUT,
        message: 'Invalid story options',
        details: validation.errors,
        service: this.serviceName,
        operation: 'generateStory'
      })
    }
    
    // Implementation...
  }
}
```

#### **3. Error Handling Standards**
All errors must be wrapped in the standard ServiceError format.

```typescript
try {
  const result = await externalAPI.call(options)
  return this.createSuccessResult(result)
} catch (error) {
  return this.createErrorResult(
    ErrorCode.INTERNAL_ERROR,
    'Failed to generate story',
    { originalError: error.message }
  )
}
```

#### **4. Logging Standards**
All services must implement consistent logging using the standard contract.

```typescript
export interface LoggingContract {
  log(level: LogLevel, message: string, context?: Record<string, any>): void
  createLogger(operation: string): OperationLogger
}

export interface OperationLogger {
  debug(message: string, context?: any): void
  info(message: string, context?: any): void
  warn(message: string, context?: any): void
  error(message: string, context?: any): void
}
```

### **Contract Testing Standards**

#### **Contract Compliance Tests**
Every service implementation must have tests that verify contract compliance.

```typescript
describe('AIStoryService Contract Compliance', () => {
  let service: AIStoryService
  
  beforeEach(() => {
    service = new AIStoryService()
  })
  
  it('should implement BaseServiceContract', () => {
    expect(service.serviceName).toBeDefined()
    expect(service.version).toBeDefined()
    expect(typeof service.healthCheck).toBe('function')
  })
  
  it('should return standardized results', async () => {
    const result = await service.generateStory(validOptions)
    
    expect(result).toHaveProperty('success')
    expect(result).toHaveProperty('metadata')
    expect(result.metadata).toHaveProperty('timestamp')
    expect(result.metadata).toHaveProperty('service')
  })
  
  it('should handle errors consistently', async () => {
    const result = await service.generateStory(invalidOptions)
    
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(ServiceError)
    expect(result.error?.code).toBeDefined()
  })
})
```

#### **Cross-Seam Integration Tests**
Test that different services can interact through their contracts.

```typescript
describe('Seam Integration', () => {
  it('should allow UI to work with any AI service implementation', async () => {
    const mockService = createMockAIStoryService()
    const ui = renderStoryGenerator({ service: mockService })
    
    // Test that UI works regardless of service implementation
    await userEvent.click(ui.generateButton)
    expect(ui.loadingIndicator).toBeVisible()
  })
})
```

### **Contract Evolution Standards**

#### **Versioning**
Contracts must be versioned to support backward compatibility.

```typescript
export interface AIStoryServiceV1 {
  generateStory(options: StoryOptionsV1): Promise<StoryResultV1>
}

export interface AIStoryServiceV2 extends AIStoryServiceV1 {
  generateStoryStream(options: StoryOptionsV2): AsyncGenerator<string>
}
```

#### **Deprecation Policy**
Deprecated contract methods must be clearly marked and supported for a transition period.

```typescript
export interface AIStoryService {
  /**
   * @deprecated Use generateStoryStream instead. Will be removed in v3.0
   */
  generateStory(options: StoryOptions): Promise<StoryResult>
  
  generateStoryStream(options: StoryOptions): AsyncGenerator<string>
}
```

This standard contract pattern ensures consistency, testability, and maintainability across all seams in the application.

### **Documentation Standards**

#### **Extensive Top-Level Comments**
Every file must have a detailed top-level comment block explaining its purpose, information flow, and architectural role. This is a critical requirement for Seam-Driven Development.

**Required Comment Structure:**
```typescript
/**
 * @fileoverview [Brief description of file purpose]
 * 
 * [Detailed explanation of what this file does and why it exists]
 * 
 * ## Architecture Context
 * - **Seam:** [Which seam this file belongs to]
 * - **Layer:** [Presentation/Application/Domain/Infrastructure]
 * - **Dependencies:** [What this file depends on]
 * - **Dependents:** [What depends on this file]
 * 
 * ## Information Flow
 * ### Input:
 * - [Describe what data/requests come into this file]
 * - [Format and validation requirements]
 * - [Source of the input data]
 * 
 * ### Processing:
 * - [Step-by-step description of what happens to the input]
 * - [Business logic and transformations]
 * - [Error handling and edge cases]
 * 
 * ### Output:
 * - [Describe what this file produces/returns]
 * - [Format and structure of output]
 * - [Destination/consumers of the output]
 * 
 * ## Contract Compliance
 * - **Implements:** [List of contracts/interfaces this file implements]
 * - **Depends on:** [List of contracts this file depends on]
 * - **Guarantees:** [What this file guarantees to provide]
 * 
 * ## Testing Strategy
 * - **Unit Tests:** [What aspects are unit tested]
 * - **Integration Tests:** [How this integrates with other components]
 * - **Mock Requirements:** [What needs to be mocked for testing]
 * 
 * ## Error Handling
 * - **Recoverable Errors:** [Errors that can be handled gracefully]
 * - **Fatal Errors:** [Errors that should terminate the operation]
 * - **Logging:** [What gets logged and at what level]
 * 
 * ## Performance Considerations
 * - **Complexity:** [Time/space complexity of operations]
 * - **Optimization:** [Any performance optimizations applied]
 * - **Monitoring:** [What metrics should be monitored]
 * 
 * ## Future Evolution
 * - **Extension Points:** [How this can be extended]
 * - **Deprecation Plan:** [When/how this might be replaced]
 * - **Migration Path:** [How to migrate away from this file]
 * 
 * @author [Author name]
 * @version [Semantic version]
 * @since [Date created]
 * @deprecated [Optional: deprecation notice]
 */
```

**Example Implementation:**
```typescript
/**
 * @fileoverview AI Story Generation Service Implementation
 * 
 * This file implements the AIStoryService contract for generating stories using
 * external AI providers. It serves as the primary seam between the application
 * and external AI services, providing a consistent interface regardless of
 * the underlying provider.
 * 
 * ## Architecture Context
 * - **Seam:** AI Generation Service Seam
 * - **Layer:** Infrastructure Layer
 * - **Dependencies:** External AI APIs, Configuration Service
 * - **Dependents:** Story Generation Feature, UI Components
 * 
 * ## Information Flow
 * ### Input:
 * - StoryOptions object containing generation parameters
 * - Must be validated against StoryOptions contract
 * - Source: UI form submissions or programmatic requests
 * 
 * ### Processing:
 * 1. Validate input options using contract specifications
 * 2. Select appropriate AI provider based on model preference
 * 3. Transform options to provider-specific format
 * 4. Make API call with proper error handling and retries
 * 5. Stream response back to caller with progress updates
 * 6. Log operation details for monitoring and debugging
 * 
 * ### Output:
 * - AsyncGenerator yielding story text chunks
 * - Each chunk contains partial story content
 * - Final chunk indicates completion
 * - Errors are thrown as ServiceError instances
 * 
 * ## Contract Compliance
 * - **Implements:** AIStoryService, BaseServiceContract
 * - **Depends on:** ConfigurationContract, LoggingContract
 * - **Guarantees:** Streaming response, error consistency, input validation
 * 
 * ## Testing Strategy
 * - **Unit Tests:** Contract compliance, input validation, error handling
 * - **Integration Tests:** Real API calls (with circuit breakers)
 * - **Mock Requirements:** AI provider APIs, configuration service
 * 
 * ## Error Handling
 * - **Recoverable Errors:** Network timeouts (with retry), rate limits
 * - **Fatal Errors:** Invalid API keys, service unavailability
 * - **Logging:** All operations logged at INFO, errors at ERROR
 * 
 * ## Performance Considerations
 * - **Complexity:** O(n) where n is story length
 * - **Optimization:** Connection pooling, response streaming
 * - **Monitoring:** Response time, success rate, error rate
 * 
 * ## Future Evolution
 * - **Extension Points:** New AI providers via provider registry
 * - **Deprecation Plan:** Legacy providers deprecated after 6 months
 * - **Migration Path:** Gradual rollout with feature flags
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @since 2025-09-11
 */
```

#### **Comment Maintenance Requirements**
- **Update Comments:** Comments must be updated whenever the file's behavior changes
- **Review Process:** Comments are reviewed during code review for accuracy
- **Documentation Sync:** Comments must match actual implementation
- **Version Tracking:** Comment versions should match code versions

#### **Additional Documentation Files**

**SEAMS.md - Seam Documentation:**
```markdown
# Application Seams Documentation

## AI Generation Service Seam
**Location:** `src/services/ai/`
**Contract:** `types/storyGeneration.ts`
**Purpose:** Isolate AI provider logic from application logic
**Benefits:** Provider swapping, testing isolation, error containment

### Seam Boundaries
- **Input Boundary:** StoryOptions from UI/application layer
- **Output Boundary:** StoryResult stream to UI layer
- **Error Boundary:** ServiceError format for consistent error handling

### Implementation Details
- **Stub Implementation:** `stubStoryService.ts` for development
- **Production Implementations:** Spark, OpenAI, Anthropic providers
- **Testing:** Full seam mocking for UI component tests

### Evolution Guidelines
- Add new providers by implementing the contract
- Maintain backward compatibility
- Document provider-specific limitations
```

**CONTRACTS.md - Contract Specifications:**
```markdown
# Contract Specifications

## BaseServiceContract
**Purpose:** Standard interface for all services
**Required Methods:** healthCheck, getCapabilities, validateConfiguration
**Benefits:** Consistent service management, monitoring, configuration

### Method Specifications
- `healthCheck()`: Returns service health status with checks array
- `getCapabilities()`: Lists supported operations and limitations
- `validateConfiguration()`: Validates service configuration

### Implementation Requirements
- All methods must be async
- Return types must match contract specifications
- Errors must use ServiceError format
```

**ARCHITECTURE.md - System Architecture:**
```markdown
# System Architecture Overview

## Layered Architecture
```
┌─────────────────────────────────────┐
│           PRESENTATION LAYER        │
│  - React Components                 │
│  - UI State Management              │
│  - User Interaction Handling        │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│         APPLICATION LAYER           │
│  - Use Cases                        │
│  - Application Services             │
│  - Business Logic Orchestration     │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│          DOMAIN LAYER               │
│  - Business Entities                │
│  - Domain Services                  │
│  - Core Business Rules              │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│        INFRASTRUCTURE LAYER         │
│  - External APIs                    │
│  - Data Persistence                 │
│  - Framework Integrations           │
└─────────────────────────────────────┘
```

## Seam Locations
- **AI Service Seam:** Between Application and Infrastructure layers
- **Voice Service Seam:** Between Application and Infrastructure layers
- **Plugin System Seam:** Within Application layer for extensibility
```

#### **Code Comment Standards**
- **Function Comments:** Every exported function must have JSDoc
- **Complex Logic:** Non-obvious logic must be explained with comments
- **TODO/FIXME:** Use standard markers for future work
- **Deprecation:** Mark deprecated code with clear migration guidance

```typescript
/**
 * Generates a story using the specified AI provider
 * @param options - Story generation options
 * @returns Async generator yielding story chunks
 * @throws ServiceError if generation fails
 */
export async function* generateStory(
  options: StoryOptions
): AsyncGenerator<string> {
  // Validate input options
  const validation = validateOptions(options)
  if (!validation.valid) {
    throw new ServiceError({
      code: ErrorCode.INVALID_INPUT,
      message: 'Invalid story options',
      details: validation.errors
    })
  }
  
  // TODO: Implement provider selection logic
  const provider = selectProvider(options.model)
  
  // Stream response from provider
  for await (const chunk of provider.generate(options)) {
    yield chunk
  }
}
```

This extensive documentation approach ensures that every developer can understand the codebase quickly and maintain it effectively, which is essential for long-term project success.

### **CI/CD Automation for SDD Enforcement**

#### **SDD Compliance Requirements**
All CI/CD pipelines must enforce the following SDD requirements:

**🔴 Blocking Requirements (Must Pass):**
- ✅ All services implement `BaseServiceContract`
- ✅ No direct service imports in UI components
- ✅ All files have extensive top-level comments
- ✅ All contracts are properly defined and exported
- ✅ Contract compliance tests exist for all services

**🟡 Quality Gates (Must Pass for Main Branch):**
- ✅ DRY principle violations detected
- ✅ Code complexity within acceptable limits
- ✅ Test coverage meets minimum thresholds
- ✅ Documentation accuracy validated

**🟢 Optional Enhancements:**
- ✅ Performance regression detection
- ✅ Bundle size monitoring
- ✅ Accessibility compliance checks

#### **CI Pipeline Architecture**

```yaml
# .github/workflows/sdd-compliance.yml
name: SDD Compliance & Quality Gates
on: [push, pull_request]

jobs:
  sdd-validation:
    name: SDD Compliance Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm ci
      
      # 🔴 BLOCKING: Contract Compliance
      - name: Validate Contract Implementation
        run: npm run validate:contracts
        continue-on-error: false
      
      # 🔴 BLOCKING: Seam Boundary Enforcement
      - name: Check Seam Boundaries
        run: npm run validate:seams
        continue-on-error: false
      
      # 🔴 BLOCKING: Documentation Requirements
      - name: Validate Extensive Comments
        run: npm run validate:documentation
        continue-on-error: false
      
      # 🟡 QUALITY: DRY Principle Check
      - name: Check DRY Compliance
        run: npm run validate:dry
        continue-on-error: ${{ github.ref != 'refs/heads/main' }}
      
      # 🟡 QUALITY: Code Quality Analysis
      - name: Run Code Quality Checks
        run: npm run quality:check
        continue-on-error: ${{ github.ref != 'refs/heads/main' }}
      
      # 🟡 QUALITY: Test Coverage
      - name: Check Test Coverage
        run: npm run test:coverage
        continue-on-error: ${{ github.ref != 'refs/heads/main' }}
```

#### **Required CI Scripts**

**Contract Validation (`scripts/validate-contracts.ts`):**
```typescript
// 🔴 BLOCKING REQUIREMENT
export async function validateContracts() {
  const project = new Project()
  project.addSourceFilesAtPaths('src/**/*.ts')
  
  const errors: string[] = []
  
  // 1. Check all service classes implement BaseServiceContract
  const serviceClasses = project.getSourceFiles()
    .flatMap(file => file.getClasses())
    .filter(cls => cls.getName()?.endsWith('Service'))
  
  for (const serviceClass of serviceClasses) {
    const implementsBaseContract = serviceClass.getImplements()
      .some(impl => impl.getText().includes('BaseServiceContract'))
    
    if (!implementsBaseContract) {
      errors.push(`❌ ${serviceClass.getName()} must implement BaseServiceContract`)
    }
  }
  
  // 2. Check all contracts are properly exported
  const contractFiles = project.getSourceFiles()
    .filter(file => file.getFilePath().includes('/types/'))
  
  for (const file of contractFiles) {
    const exports = file.getExportedDeclarations()
    if (exports.size === 0) {
      errors.push(`❌ ${file.getFilePath()} must export at least one contract`)
    }
  }
  
  // 3. Check contract naming conventions
  const interfaces = project.getSourceFiles()
    .flatMap(file => file.getInterfaces())
  
  for (const interfaceDecl of interfaces) {
    const name = interfaceDecl.getName()
    if (name && !name.endsWith('Contract') && !name.endsWith('Service')) {
      errors.push(`❌ Interface ${name} should end with 'Contract' or 'Service'`)
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Contract validation failed:\n${errors.join('\n')}`)
  }
  
  console.log('✅ All contract validations passed')
}
```

**Seam Boundary Validation (`scripts/validate-seams.ts`):**
```typescript
// 🔴 BLOCKING REQUIREMENT
export async function validateSeams() {
  const project = new Project()
  project.addSourceFilesAtPaths('src/**/*.ts')
  
  const violations: string[] = []
  
  // 1. UI components must not import services directly
  const uiFiles = project.getSourceFiles()
    .filter(file => file.getFilePath().includes('/components/'))
  
  for (const file of uiFiles) {
    const imports = file.getImportDeclarations()
    
    for (const importDecl of imports) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue()
      
      if (moduleSpecifier.includes('/services/') && 
          !moduleSpecifier.includes('/types/')) {
        violations.push(
          `❌ ${file.getFilePath()}: UI component importing service directly: ${moduleSpecifier}`
        )
      }
    }
  }
  
  // 2. Infrastructure should not depend on presentation
  const infraFiles = project.getSourceFiles()
    .filter(file => file.getFilePath().includes('/services/'))
  
  for (const file of infraFiles) {
    const imports = file.getImportDeclarations()
    
    for (const importDecl of imports) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue()
      
      if (moduleSpecifier.includes('/components/')) {
        violations.push(
          `❌ ${file.getFilePath()}: Infrastructure importing presentation: ${moduleSpecifier}`
        )
      }
    }
  }
  
  if (violations.length > 0) {
    throw new Error(`Seam boundary violations:\n${violations.join('\n')}`)
  }
  
  console.log('✅ All seam boundaries validated')
}
```

**Documentation Validation (`scripts/validate-documentation.ts`):**
```typescript
// 🔴 BLOCKING REQUIREMENT
export async function validateDocumentation() {
  const project = new Project()
  project.addSourceFilesAtPaths('src/**/*.ts')
  
  const missingDocs: string[] = []
  
  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath()
    
    // Skip test files and generated files
    if (filePath.includes('.test.') || filePath.includes('.generated.')) {
      continue
    }
    
    const fileText = sourceFile.getFullText()
    
    // 1. Check for extensive top-level comment
    const hasExtensiveComment = 
      fileText.includes('@fileoverview') &&
      fileText.includes('## Architecture Context') &&
      fileText.includes('## Information Flow') &&
      fileText.includes('## Contract Compliance')
    
    if (!hasExtensiveComment) {
      missingDocs.push(`❌ ${filePath}: Missing extensive top-level comment`)
    }
    
    // 2. Check exported functions have JSDoc
    const exportedFunctions = sourceFile.getFunctions()
      .filter(fn => fn.isExported())
    
    for (const fn of exportedFunctions) {
      const hasJSDoc = fn.getJsDocs().length > 0
      if (!hasJSDoc) {
        missingDocs.push(`❌ ${filePath}: ${fn.getName()} missing JSDoc`)
      }
    }
    
    // 3. Check exported classes have documentation
    const exportedClasses = sourceFile.getClasses()
      .filter(cls => cls.isExported())
    
    for (const cls of exportedClasses) {
      const hasJSDoc = cls.getJsDocs().length > 0
      if (!hasJSDoc) {
        missingDocs.push(`❌ ${filePath}: ${cls.getName()} class missing JSDoc`)
      }
    }
    
    // 4. Check exported interfaces have documentation
    const exportedInterfaces = sourceFile.getInterfaces()
      .filter(iface => iface.isExported())
    
    for (const iface of exportedInterfaces) {
      const hasJSDoc = iface.getJsDocs().length > 0
      if (!hasJSDoc) {
        missingDocs.push(`❌ ${filePath}: ${iface.getName()} interface missing JSDoc`)
      }
    }
  }
  
  if (missingDocs.length > 0) {
    throw new Error(`Documentation validation failed:\n${missingDocs.join('\n')}`)
  }
  
  console.log('✅ All documentation requirements met')
}
```

**DRY Principle Validation (`scripts/validate-dry.ts`):**
```typescript
// 🟡 QUALITY REQUIREMENT
export async function validateDRY() {
  const project = new Project()
  project.addSourceFilesAtPaths('src/**/*.ts')
  
  const duplicates: string[] = []
  const codeSnippets = new Map<string, string[]>()
  
  // 1. Check for duplicate code blocks (10+ lines)
  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath()
    const statements = sourceFile.getStatements()
    
    for (let i = 0; i < statements.length - 10; i++) {
      const codeBlock = statements.slice(i, i + 10)
        .map(stmt => stmt.getText())
        .join('\n')
      
      if (codeBlock.length > 200) { // Significant code block
        const existing = codeSnippets.get(codeBlock)
        if (existing) {
          existing.push(filePath)
        } else {
          codeSnippets.set(codeBlock, [filePath])
        }
      }
    }
  }
  
  // Report duplicates
  for (const [code, files] of codeSnippets) {
    if (files.length > 1) {
      duplicates.push(`⚠️  Duplicate code found in:\n${files.map(f => `   - ${f}`).join('\n')}`)
    }
  }
  
  // 2. Check for duplicate function names
  const functionNames = new Map<string, string[]>()
  for (const sourceFile of project.getSourceFiles()) {
    const functions = sourceFile.getFunctions()
    
    for (const fn of functions) {
      const name = fn.getName()
      if (name) {
        const existing = functionNames.get(name)
        if (existing) {
          existing.push(sourceFile.getFilePath())
        } else {
          functionNames.set(name, [sourceFile.getFilePath()])
        }
      }
    }
  }
  
  // Report duplicate function names
  for (const [name, files] of functionNames) {
    if (files.length > 1) {
      duplicates.push(`⚠️  Function '${name}' duplicated in:\n${files.map(f => `   - ${f}`).join('\n')}`)
    }
  }
  
  if (duplicates.length > 0) {
    console.warn(`DRY violations detected:\n${duplicates.join('\n\n')}`)
    
    // For main branch, fail the build
    if (process.env.GITHUB_REF === 'refs/heads/main') {
      throw new Error('DRY violations found on main branch')
    }
  } else {
    console.log('✅ No DRY violations detected')
  }
}
```

#### **Code Quality Validation (`scripts/validate-quality.ts`)**

```typescript
// 🟡 QUALITY REQUIREMENT
export async function validateCodeQuality() {
  const project = new Project()
  project.addSourceFilesAtPaths('src/**/*.ts')
  
  const issues: string[] = []
  
  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath()
    
    // 1. Check function complexity
    const functions = sourceFile.getFunctions()
    for (const fn of functions) {
      const complexity = calculateCyclomaticComplexity(fn)
      if (complexity > 10) {
        issues.push(`⚠️  ${filePath}: ${fn.getName()} has high complexity (${complexity})`)
      }
    }
    
    // 2. Check class size
    const classes = sourceFile.getClasses()
    for (const cls of classes) {
      const lineCount = cls.getEndLineNumber() - cls.getStartLineNumber()
      if (lineCount > 300) {
        issues.push(`⚠️  ${filePath}: ${cls.getName()} class is too large (${lineCount} lines)`)
      }
    }
    
    // 3. Check file size
    const totalLines = sourceFile.getEndLineNumber()
    if (totalLines > 500) {
      issues.push(`⚠️  ${filePath}: File is too large (${totalLines} lines)`)
    }
    
    // 4. Check for any types
    const anyTypes = sourceFile.getDescendantsOfKind(SyntaxKind.AnyKeyword)
    if (anyTypes.length > 0) {
      issues.push(`⚠️  ${filePath}: Found ${anyTypes.length} 'any' types`)
    }
    
    // 5. Check for console.log statements
    const consoleLogs = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter(call => {
        const expression = call.getExpression()
        return expression.getText().startsWith('console.')
      })
    
    if (consoleLogs.length > 0) {
      issues.push(`⚠️  ${filePath}: Found ${consoleLogs.length} console statements`)
    }
  }
  
  if (issues.length > 0) {
    console.warn(`Code quality issues:\n${issues.join('\n')}`)
    
    // For main branch, fail if critical issues exist
    const criticalIssues = issues.filter(issue => 
      issue.includes('any') || issue.includes('console')
    )
    
    if (criticalIssues.length > 0 && process.env.GITHUB_REF === 'refs/heads/main') {
      throw new Error('Critical code quality issues found on main branch')
    }
  } else {
    console.log('✅ Code quality checks passed')
  }
}

function calculateCyclomaticComplexity(functionDeclaration: FunctionDeclaration): number {
  let complexity = 1
  
  // Count control flow statements
  const controlFlowKeywords = [
    SyntaxKind.IfStatement,
    SyntaxKind.ForStatement,
    SyntaxKind.WhileStatement,
    SyntaxKind.DoStatement,
    SyntaxKind.SwitchStatement,
    SyntaxKind.ConditionalExpression,
    SyntaxKind.LogicalAnd,
    SyntaxKind.LogicalOr
  ]
  
  for (const keyword of controlFlowKeywords) {
    const count = functionDeclaration.getDescendantsOfKind(keyword).length
    complexity += count
  }
  
  return complexity
}
```

#### **Test Coverage Validation (`scripts/validate-coverage.ts`)**

```typescript
// 🟡 QUALITY REQUIREMENT
export async function validateTestCoverage() {
  const project = new Project()
  project.addSourceFilesAtPaths(['src/**/*.ts', 'src/**/*.test.ts'])
  
  const coverage: string[] = []
  
  // 1. Check contract test coverage
  const contracts = project.getSourceFiles()
    .filter(file => file.getFilePath().includes('/types/'))
    .flatMap(file => file.getInterfaces())
  
  for (const contract of contracts) {
    const contractName = contract.getName()
    const testFileName = `${contractName}.test.ts`
    
    const testFile = project.getSourceFile(`src/types/__tests__/${testFileName}`)
    if (!testFile) {
      coverage.push(`❌ Missing contract test: ${testFileName}`)
    }
  }
  
  // 2. Check service test coverage
  const services = project.getSourceFiles()
    .filter(file => file.getFilePath().includes('/services/'))
    .filter(file => !file.getFilePath().includes('.test.'))
  
  for (const service of services) {
    const serviceName = service.getBaseNameWithoutExtension()
    const testFileName = `${serviceName}.test.ts`
    
    const testFile = project.getSourceFile(`src/services/__tests__/${testFileName}`)
    if (!testFile) {
      coverage.push(`❌ Missing service test: ${testFileName}`)
    }
  }
  
  // 3. Check component test coverage
  const components = project.getSourceFiles()
    .filter(file => file.getFilePath().includes('/components/'))
    .filter(file => !file.getFilePath().includes('.test.'))
  
  for (const component of components) {
    const componentName = component.getBaseNameWithoutExtension()
    const testFileName = `${componentName}.test.tsx`
    
    const testFile = project.getSourceFile(`src/components/__tests__/${testFileName}`)
    if (!testFile) {
      coverage.push(`❌ Missing component test: ${testFileName}`)
    }
  }
  
  if (coverage.length > 0) {
    console.warn(`Test coverage gaps:\n${coverage.join('\n')}`)
    
    if (process.env.GITHUB_REF === 'refs/heads/main') {
      throw new Error('Test coverage requirements not met on main branch')
    }
  } else {
    console.log('✅ Test coverage requirements met')
  }
}
```

#### **Pre-commit Hook Setup**

```bash
#!/bin/sh
# .husky/pre-commit

echo "🔍 Running SDD compliance checks..."

# 🔴 BLOCKING: Must pass for any commit
echo "Checking contract compliance..."
npm run validate:contracts

echo "Checking seam boundaries..."
npm run validate:seams

echo "Checking documentation..."
npm run validate:documentation

# 🟡 QUALITY: Warnings for feature branches
echo "Checking DRY compliance..."
npm run validate:dry || echo "⚠️  DRY violations detected (non-blocking)"

echo "Checking code quality..."
npm run validate:quality || echo "⚠️  Code quality issues detected (non-blocking)"

echo "✅ SDD compliance checks completed"
```

#### **CI Failure Handling**

**For Pull Requests:**
```yaml
# Comment on PR with detailed feedback
- name: Comment on PR
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      const { exec } = require('child_process')
      
      exec('npm run validate:contracts 2>&1', (error, stdout) => {
        const body = error ? 
          `❌ **Contract Validation Failed**\n\`\`\`\n${stdout}\n\`\`\`` :
          `✅ **Contract Validation Passed**`
        
        github.rest.issues.createComment({
          issue_number: context.issue.number,
          owner: context.repo.owner,
          repo: context.repo.repo,
          body
        })
      })
```

**For Main Branch:**
- ❌ **Block merges** if blocking requirements fail
- ⚠️ **Allow merges** with warnings for quality issues
- 📊 **Generate reports** for quality metrics
- 📧 **Notify team** of critical issues

#### **Quality Metrics Dashboard**

```yaml
# Generate quality metrics
- name: Generate Quality Report
  run: |
    echo "## SDD Quality Metrics" >> quality-report.md
    echo "- Contract Compliance: $(npm run validate:contracts --silent && echo '✅' || echo '❌')" >> quality-report.md
    echo "- DRY Violations: $(npm run validate:dry --silent | grep -c '⚠️' || echo '0')" >> quality-report.md
    echo "- Code Quality Issues: $(npm run validate:quality --silent | grep -c '⚠️' || echo '0')" >> quality-report.md
    echo "- Test Coverage: $(npm run test:coverage --silent | grep -o '[0-9]\+%' | head -1)" >> quality-report.md
    
    cat quality-report.md
```

This CI/CD setup ensures that SDD principles are enforced automatically, with clear blocking requirements for critical compliance issues and quality gates for ongoing improvement.

#### **Automated Contract Validation Script**
```typescript
// scripts/validate-contracts.ts
import { Project, InterfaceDeclaration, ClassDeclaration } from 'ts-morph'

export async function validateContracts() {
  const project = new Project()
  project.addSourceFilesAtPaths('src/**/*.ts')
  
  const errors: string[] = []
  
  // Check all service classes implement BaseServiceContract
  const serviceClasses = project.getSourceFiles()
    .flatMap(file => file.getClasses())
    .filter(cls => cls.getName()?.endsWith('Service'))
  
  for (const serviceClass of serviceClasses) {
    const implementsBaseContract = serviceClass.getImplements()
      .some(impl => impl.getText().includes('BaseServiceContract'))
    
    if (!implementsBaseContract) {
      errors.push(`${serviceClass.getName()} must implement BaseServiceContract`)
    }
  }
  
  // Check all contracts are properly exported
  const contractFiles = project.getSourceFiles()
    .filter(file => file.getFilePath().includes('/types/'))
  
  for (const file of contractFiles) {
    const exports = file.getExportedDeclarations()
    if (exports.size === 0) {
      errors.push(`${file.getFilePath()} must export at least one contract`)
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Contract validation failed:\n${errors.join('\n')}`)
  }
}
```

#### **Seam Boundary Enforcement**
Ensure proper separation between architectural layers.

```typescript
// scripts/validate-seams.ts
export async function validateSeams() {
  const project = new Project()
  project.addSourceFilesAtPaths('src/**/*.ts')
  
  const violations: string[] = []
  
  // Check that UI components don't import infrastructure directly
  const uiFiles = project.getSourceFiles()
    .filter(file => file.getFilePath().includes('/components/'))
  
  for (const file of uiFiles) {
    const imports = file.getImportDeclarations()
    
    for (const importDecl of imports) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue()
      
      // UI should not import infrastructure services directly
      if (moduleSpecifier.includes('/services/') && 
          !moduleSpecifier.includes('/types/')) {
        violations.push(
          `${file.getFilePath()}: UI component importing service directly: ${moduleSpecifier}`
        )
      }
    }
  }
  
  if (violations.length > 0) {
    throw new Error(`Seam boundary violations:\n${violations.join('\n')}`)
  }
}
```

#### **Documentation Validation**
Automated checks for required extensive comments.

```typescript
// scripts/validate-documentation.ts
export async function validateDocumentation() {
  const project = new Project()
  project.addSourceFilesAtPaths('src/**/*.ts')
  
  const missingDocs: string[] = []
  
  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath()
    
    // Skip test files and generated files
    if (filePath.includes('.test.') || filePath.includes('.generated.')) {
      continue
    }
    
    const fileText = sourceFile.getFullText()
    const hasExtensiveComment = 
      fileText.includes('@fileoverview') &&
      fileText.includes('## Architecture Context') &&
      fileText.includes('## Information Flow') &&
      fileText.includes('## Contract Compliance')
    
    if (!hasExtensiveComment) {
      missingDocs.push(filePath)
    }
    
    // Check exported functions have JSDoc
    const exportedFunctions = sourceFile.getFunctions()
      .filter(fn => fn.isExported())
    
    for (const fn of exportedFunctions) {
      const hasJSDoc = fn.getJsDocs().length > 0
      if (!hasJSDoc) {
        missingDocs.push(`${filePath}: ${fn.getName()} missing JSDoc`)
      }
    }
  }
  
  if (missingDocs.length > 0) {
    throw new Error(`Missing documentation:\n${missingDocs.join('\n')}`)
  }
}
```

#### **Architecture Rule Enforcement**
Custom ESLint rules for SDD compliance.

```javascript
// eslint-plugin-sdd/index.js
module.exports = {
  rules: {
    'no-direct-service-import': {
      create: function(context) {
        return {
          ImportDeclaration(node) {
            const importPath = node.source.value
            
            // Check if UI component is importing service directly
            if (context.getFilename().includes('/components/') &&
                importPath.includes('/services/') &&
                !importPath.includes('/types/')) {
              context.report({
                node,
                message: 'UI components must import service contracts, not implementations'
              })
            }
          }
        }
      }
    },
    
    'require-extensive-comment': {
      create: function(context) {
        return {
          Program(node) {
            const sourceCode = context.getSourceCode()
            const comments = sourceCode.getAllComments()
            const fileComment = comments.find(comment => 
              comment.type === 'Block' && 
              comment.value.includes('@fileoverview')
            )
            
            if (!fileComment) {
              context.report({
                node,
                message: 'File must have extensive top-level comment with @fileoverview'
              })
            }
          }
        }
      }
    }
  }
}
```

#### **Test Coverage Validation**
Ensure all contracts have corresponding tests.

```typescript
// scripts/validate-test-coverage.ts
export async function validateTestCoverage() {
  const project = new Project()
  project.addSourceFilesAtPaths(['src/**/*.ts', 'src/**/*.test.ts'])
  
  const missingTests: string[] = []
  
  // Find all contract interfaces
  const contracts = project.getSourceFiles()
    .filter(file => file.getFilePath().includes('/types/'))
    .flatMap(file => file.getInterfaces())
  
  for (const contract of contracts) {
    const contractName = contract.getName()
    const testFileName = `${contractName}.test.ts`
    
    // Check if corresponding test file exists
    const testFile = project.getSourceFile(testFileName)
    if (!testFile) {
      missingTests.push(`Missing test file: ${testFileName}`)
    }
  }
  
  // Check service implementations have tests
  const services = project.getSourceFiles()
    .filter(file => file.getFilePath().includes('/services/'))
    .filter(file => !file.getFilePath().includes('.test.'))
  
  for (const service of services) {
    const serviceName = service.getBaseNameWithoutExtension()
    const testFileName = `${serviceName}.test.ts`
    
    const testFile = project.getSourceFile(`src/services/__tests__/${testFileName}`)
    if (!testFile) {
      missingTests.push(`Missing service test: ${testFileName}`)
    }
  }
  
  if (missingTests.length > 0) {
    throw new Error(`Missing test coverage:\n${missingTests.join('\n')}`)
  }
}
```

### **Pre-commit Hooks**
Enforce SDD rules before code is committed.

```bash
#!/bin/sh
# .husky/pre-commit

echo "Running SDD validation..."

# Run contract validation
npm run validate:contracts

# Run seam boundary checks
npm run validate:seams

# Run documentation validation
npm run validate:docs

# Run architecture checks
npm run validate:architecture

echo "SDD validation passed!"
```

### **Automated Code Review**
GitHub Actions for automated PR reviews.

```yaml
# .github/workflows/pr-review.yml
name: PR Review
on: pull_request

jobs:
  sdd-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: SDD Compliance Check
        uses: actions/github-script@v7
        with:
          script: |
            const { validateContracts } = require('./scripts/validate-contracts.ts')
            const { validateSeams } = require('./scripts/validate-seams.ts')
            const { validateDocumentation } = require('./scripts/validate-documentation.ts')
            
            try {
              await validateContracts()
              await validateSeams()
              await validateDocumentation()
              
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: '✅ SDD compliance checks passed!'
              })
            } catch (error) {
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: `❌ SDD validation failed:\n\`\`\`\n${error.message}\n\`\`\``
              })
              
              process.exit(1)
            }
```

---

## 🤖 **Custom Copilot Instructions for SDD**

### **Contract-First Development Instructions**
```markdown
# Copilot Instructions: Seam-Driven Development

## Context
You are an expert in Seam-Driven Development (SDD) for TypeScript/React applications. Always follow these principles:

1. **Contract First**: Define interfaces before implementations
2. **Seam Awareness**: Identify and respect architectural boundaries
3. **Extensive Documentation**: Every file needs detailed comments
4. **Testability**: Design for isolated testing with mocks

## When Writing Code

### For New Service Classes:
```typescript
/**
 * @fileoverview [Service Name] Implementation
 * 
 * [Detailed description of service purpose and seam location]
 * 
 * ## Architecture Context
 * - **Seam:** [Which seam this belongs to]
 * - **Layer:** Infrastructure
 * - **Dependencies:** [External services/APIs]
 * - **Dependents:** [Application layer components]
 * 
 * ## Contract Compliance
 * - **Implements:** BaseServiceContract, [Specific Contract]
 * - **Guarantees:** [What this service guarantees]
 */

export class [ServiceName] implements BaseServiceContract, [SpecificContract] {
  readonly serviceName = '[service-name]'
  readonly version = '1.0.0'
  
  async healthCheck(): Promise<ServiceHealth> {
    // Implementation
  }
  
  async getCapabilities(): Promise<ServiceCapabilities> {
    // Implementation
  }
  
  // [Specific contract methods]
}
```

### For React Components:
```typescript
/**
 * @fileoverview [Component Name] Component
 * 
 * [Component purpose and role in UI]
 * 
 * ## Architecture Context
 * - **Seam:** Presentation Layer
 * - **Dependencies:** [Contracts only, no direct service imports]
 * - **Dependents:** Parent components, application layer
 * 
 * ## Information Flow
 * ### Input: Props containing contract-compliant data
 * ### Processing: UI logic and state management
 * ### Output: User interactions and contract-compliant callbacks
 */

interface [ComponentName]Props {
  // Contract-based props only
  service: [ContractType] // Never concrete implementation
  onAction: (data: [ContractType]) => void
}

export function [ComponentName]({ service, onAction }: [ComponentName]Props) {
  // Component implementation
}
```

### For Contract Definitions:
```typescript
/**
 * @fileoverview [Contract Name] Contract
 * 
 * Defines the contract for [service/feature] operations.
 * This contract establishes the seam boundary between [layer A] and [layer B].
 * 
 * ## Contract Purpose
 * - **What:** [What this contract defines]
 * - **Why:** [Why this abstraction is needed]
 * - **Benefits:** [Testing, modularity, etc.]
 * 
 * ## Implementation Requirements
 * - All implementations must validate inputs
 * - All implementations must use ServiceError format
 * - All implementations must be async where appropriate
 */

export interface [ContractName] {
  // Method with detailed contract specification
  /**
   * [Method description]
   * @param input - [Input specification with validation rules]
   * @returns [Output specification with format requirements]
   * @throws ServiceError with specific error codes
   */
  methodName(input: InputType): Promise<OutputType>
}
```

## Code Review Checklist

When reviewing code, ensure:
- [ ] All files have extensive top-level comments
- [ ] No direct service imports in UI components
- [ ] All services implement BaseServiceContract
- [ ] Contracts are defined before implementations
- [ ] Error handling uses ServiceError format
- [ ] Tests mock contracts, not implementations
- [ ] Documentation matches implementation

## Common Patterns to Avoid

❌ **Don't do this:**
```typescript
// UI component importing service directly
import { RealStoryService } from '../services/storyService'

// Using concrete implementation instead of contract
const service = new RealStoryService()
```

✅ **Do this instead:**
```typescript
// UI component using contract
import type { AIStoryService } from '../types/storyGeneration'

// Component receives contract-compliant service
interface Props {
  service: AIStoryService // Contract, not implementation
}
```

## Testing Patterns

For testing SDD code:
```typescript
describe('[ServiceName]', () => {
  let mockContract: jest.Mocked<AIStoryService>
  
  beforeEach(() => {
    mockContract = {
      generateStoryStream: jest.fn(),
      validateOptions: jest.fn()
    }
  })
  
  it('should call contract methods correctly', () => {
    // Test implementation using mocked contract
  })
})
```

Remember: In SDD, you test implementations against contracts, and you mock contracts to test UI components. Never mock concrete implementations.
```

### **Component Development Instructions**
```markdown
# Copilot Instructions: React Component Development (SDD)

## Component Architecture

### Atomic Design with SDD:
```
Atoms (Basic UI) → Molecules (Compositions) → Organisms (Complex UI) → Templates (Page Layouts)
```

### Component Contract:
```typescript
/**
 * @fileoverview [ComponentName] - [Atom/Molecule/Organism]
 * 
 * [Brief description of component's role]
 * 
 * ## Architecture Context
 * - **Type:** [Atom/Molecule/Organism]
 * - **Dependencies:** UI contracts only
 * - **Seam:** Presentation layer
 * 
 * ## Props Contract
 * - All props must be serializable (no functions in props except callbacks)
 * - Callback props must follow contract patterns
 * - No direct service dependencies
 */

interface [ComponentName]Props {
  // Data props (contract-compliant)
  data: [ContractType]
  
  // Callback props (contract-compliant)
  onAction: (result: [ContractType]) => void
  
  // Configuration props
  config?: [ConfigContract]
}

interface [ComponentName]State {
  // Local state only (no business logic)
  isLoading: boolean
  error?: ServiceError
}
```

### State Management:
```typescript
export function [ComponentName]({ data, onAction, config }: [ComponentName]Props) {
  const [localState, setLocalState] = useState<[ComponentName]State>({
    isLoading: false
  })
  
  // Business logic goes to custom hooks
  const { processedData, actions } = use[ComponentName]Logic(data, config)
  
  return (
    // JSX using processed data and local state
  )
}
```

## Custom Hook Patterns

### Business Logic Hooks:
```typescript
/**
 * @fileoverview [ComponentName] Logic Hook
 * 
 * Contains business logic for [ComponentName] component.
 * Separates UI concerns from business logic following SDD.
 * 
 * ## Architecture Context
 * - **Seam:** Application layer hook
 * - **Dependencies:** Service contracts
 * - **Purpose:** Business logic orchestration
 */

export function use[ComponentName]Logic(
  data: [DataContract], 
  config?: [ConfigContract]
) {
  const [state, setState] = useState<LogicState>({})
  
  // Business logic here
  const actions = useMemo(() => ({
    handleAction: async (input: [InputContract]) => {
      try {
        setState(prev => ({ ...prev, isLoading: true }))
        
        // Use service contracts
        const result = await service.process(input)
        
        // Transform to UI-friendly format
        const uiData = transformToUI(result)
        
        onAction(uiData)
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error as ServiceError 
        }))
      } finally {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }
  }), [data, config])
  
  return {
    processedData: transformData(data),
    actions,
    isLoading: state.isLoading,
    error: state.error
  }
}
```

## Error Handling Patterns

### Component-Level Error Boundaries:
```typescript
export class [ComponentName]ErrorBoundary extends Component {
  state = { hasError: false, error?: Error }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log using contract-compliant logger
    logger.error('Component error', { error, errorInfo })
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    
    return this.props.children
  }
}
```

### User-Friendly Error Display:
```typescript
export function ErrorDisplay({ error }: { error: ServiceError }) {
  const message = useMemo(() => {
    switch (error.code) {
      case ErrorCode.NETWORK_ERROR:
        return 'Connection problem. Please check your internet.'
      case ErrorCode.INVALID_INPUT:
        return 'Please check your input and try again.'
      default:
        return 'Something went wrong. Please try again.'
    }
  }, [error.code])
  
  return (
    <Alert variant="error">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {error.recoverable && (
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      )}
    </Alert>
  )
}
```

## Testing Patterns

### Component Testing:
```typescript
describe('[ComponentName]', () => {
  const mockProps: [ComponentName]Props = {
    data: mockContractData,
    onAction: jest.fn(),
    config: mockConfig
  }
  
  it('should render correctly', () => {
    render(<[ComponentName] {...mockProps} />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
  
  it('should call onAction with contract-compliant data', async () => {
    render(<[ComponentName] {...mockProps} />)
    
    await userEvent.click(screen.getByRole('button'))
    
    expect(mockProps.onAction).toHaveBeenCalledWith(
      expect.objectContaining({
        // Contract-compliant expectations
        id: expect.any(String),
        timestamp: expect.any(Date)
      })
    )
  })
})
```

### Hook Testing:
```typescript
describe('use[ComponentName]Logic', () => {
  const mockService = createMock[ServiceContract]()
  
  it('should process data correctly', () => {
    const { result } = renderHook(() => 
      use[ComponentName]Logic(mockData, mockService)
    )
    
    expect(result.current.processedData).toEqual(expectedProcessedData)
  })
  
  it('should handle errors gracefully', async () => {
    mockService.process.mockRejectedValue(mockError)
    
    const { result } = renderHook(() => 
      use[ComponentName]Logic(mockData, mockService)
    )
    
    await act(async () => {
      await result.current.actions.handleAction(mockInput)
    })
    
    expect(result.current.error).toEqual(mockError)
  })
})
```

## Performance Patterns

### Memoization:
```typescript
export const [ComponentName] = memo(function [ComponentName](
  { data, onAction }: [ComponentName]Props
) {
  const processedData = useMemo(() => 
    expensiveTransformation(data), 
    [data.id, data.timestamp] // Specific dependencies
  )
  
  const handleAction = useCallback((input: InputType) => {
    onAction(processedData)
  }, [onAction, processedData])
  
  return (
    // Component JSX
  )
})
```

### Lazy Loading:
```typescript
const Lazy[ComponentName] = lazy(() => 
  import('./[ComponentName]')
)

export function [ComponentName]Wrapper(props: [ComponentName]Props) {
  return (
    <Suspense fallback={<Skeleton />}>
      <Lazy[ComponentName] {...props} />
    </Suspense>
  )
}
```

Remember: Components should be presentation-only. All business logic, API calls, and complex state management should be in custom hooks that follow SDD contracts.
```

### **Service Development Instructions**
```markdown
# Copilot Instructions: Service Development (SDD)

## Service Architecture

### Service Contract Implementation:
```typescript
/**
 * @fileoverview [ServiceName] Service Implementation
 * 
 * Implements the [ServiceContract] for [specific functionality].
 * This service forms the [SeamName] seam boundary.
 * 
 * ## Architecture Context
 * - **Seam:** [Seam this service belongs to]
 * - **Layer:** Infrastructure
 * - **External Dependencies:** [APIs, libraries, etc.]
 * - **Contract:** [ContractName]
 * 
 * ## Information Flow
 * ### Input: [ContractType] objects with validation
 * ### Processing: [Step-by-step business logic]
 * ### Output: [ContractType] results or ServiceError
 * 
 * ## Contract Compliance
 * - **Implements:** BaseServiceContract, [SpecificContract]
 * - **Guarantees:** [Reliability, performance, error handling guarantees]
 * 
 * ## Error Handling
 * - **Recoverable:** [Network issues, rate limits]
 * - **Fatal:** [Configuration errors, authentication failures]
 * - **Logging:** [What gets logged at which levels]
 */

export class [ServiceName] implements BaseServiceContract, [SpecificContract] {
  readonly serviceName = '[service-name]'
  readonly version = '1.0.0'
  
  private logger: LoggerContract
  private config: ServiceConfiguration
  
  constructor(
    logger: LoggerContract,
    config: ServiceConfiguration
  ) {
    this.logger = logger
    this.config = config
  }
  
  // BaseServiceContract implementation
  async healthCheck(): Promise<ServiceHealth> {
    try {
      // Check external service availability
      await this.performHealthCheck()
      
      return {
        status: 'healthy',
        timestamp: new Date(),
        checks: [{
          name: 'external_service',
          status: 'healthy',
          timestamp: new Date()
        }]
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        checks: [{
          name: 'external_service',
          status: 'unhealthy',
          timestamp: new Date(),
          error: error.message
        }]
      }
    }
  }
  
  async getCapabilities(): Promise<ServiceCapabilities> {
    return {
      supportedOperations: ['operation1', 'operation2'],
      limitations: ['limitation1', 'limitation2'],
      metadata: {
        provider: 'provider_name',
        region: this.config.region
      }
    }
  }
  
  async validateConfiguration(): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    
    if (!this.config.apiKey) {
      errors.push({
        field: 'apiKey',
        message: 'API key is required'
      })
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    }
  }
  
  getConfiguration(): ServiceConfiguration {
    // Return sanitized configuration (no secrets)
    return {
      ...this.config,
      apiKey: this.config.apiKey ? '[REDACTED]' : undefined
    }
  }
  
  async initialize(): Promise<void> {
    this.logger.info('Initializing service', { service: this.serviceName })
    
    // Perform initialization logic
    await this.setupConnections()
    await this.validateConfiguration()
  }
  
  async dispose(): Promise<void> {
    this.logger.info('Disposing service', { service: this.serviceName })
    
    // Cleanup resources
    await this.closeConnections()
  }
  
  // Specific contract implementation
  async [specificMethod](input: [InputType]): Promise<[OutputType]> {
    const startTime = Date.now()
    
    try {
      this.logger.debug('Starting operation', { 
        operation: '[specificMethod]',
        input: this.sanitizeInput(input)
      })
      
      // Validate input
      const validation = this.validateInput(input)
      if (!validation.valid) {
        throw new ServiceError({
          code: ErrorCode.INVALID_INPUT,
          message: 'Invalid input provided',
          details: validation.errors,
          service: this.serviceName,
          operation: '[specificMethod]'
        })
      }
      
      // Perform operation
      const result = await this.performOperation(input)
      
      // Log success
      const duration = Date.now() - startTime
      this.logger.info('Operation completed', {
        operation: '[specificMethod]',
        duration,
        success: true
      })
      
      return result
      
    } catch (error) {
      // Log error
      const duration = Date.now() - startTime
      this.logger.error('Operation failed', {
        operation: '[specificMethod]',
        duration,
        error: error.message,
        stack: error.stack
      })
      
      // Re-throw as ServiceError if not already
      if (!(error instanceof ServiceError)) {
        throw new ServiceError({
          code: ErrorCode.INTERNAL_ERROR,
          message: error.message,
          details: { originalError: error.message },
          service: this.serviceName,
          operation: '[specificMethod]',
          recoverable: this.isRecoverableError(error)
        })
      }
      
      throw error
    }
  }
  
  // Private helper methods
  private async performHealthCheck(): Promise<void> {
    // Implementation
  }
  
  private validateInput(input: [InputType]): ValidationResult {
    // Implementation
  }
  
  private async performOperation(input: [InputType]): Promise<[OutputType]> {
    // Implementation
  }
  
  private sanitizeInput(input: [InputType]): any {
    // Remove sensitive data for logging
  }
  
  private isRecoverableError(error: Error): boolean {
    // Determine if error is recoverable
  }
  
  private async setupConnections(): Promise<void> {
    // Implementation
  }
  
  private async closeConnections(): Promise<void> {
    // Implementation
  }
}
```

## Service Patterns

### Configuration Management:
```typescript
export interface ServiceConfiguration {
  apiKey?: string
  baseUrl: string
  timeout: number
  retryAttempts: number
  region?: string
}

export class ConfigurationManager {
  private static instance: ConfigurationManager
  private config: Map<string, ServiceConfiguration> = new Map()
  
  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager()
    }
    return ConfigurationManager.instance
  }
  
  setConfig(serviceName: string, config: ServiceConfiguration): void {
    this.config.set(serviceName, config)
  }
  
  getConfig(serviceName: string): ServiceConfiguration | undefined {
    return this.config.get(serviceName)
  }
  
  validateAllConfigs(): ValidationResult {
    const errors: ValidationError[] = []
    
    for (const [serviceName, config] of this.config) {
      // Validate each service configuration
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    }
  }
}
```

### Circuit Breaker Pattern:
```typescript
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  
  constructor(
    private failureThreshold: number,
    private recoveryTimeout: number
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'half-open'
      } else {
        throw new ServiceError({
          code: ErrorCode.SERVICE_UNAVAILABLE,
          message: 'Circuit breaker is open',
          service: 'circuit-breaker',
          operation: 'execute'
        })
      }
    }
    
    try {
      const result = await operation()
      
      if (this.state === 'half-open') {
        this.reset()
      }
      
      return result
    } catch (error) {
      this.recordFailure()
      throw error
    }
  }
  
  private recordFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'open'
    }
  }
  
  private reset(): void {
    this.failures = 0
    this.state = 'closed'
  }
}
```

### Retry Mechanism:
```typescript
export class RetryManager {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxAttempts: number
      baseDelay: number
      maxDelay: number
      backoffFactor: number
      retryCondition?: (error: Error) => boolean
    }
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        // Check if we should retry
        if (attempt === options.maxAttempts) {
          break
        }
        
        if (options.retryCondition && !options.retryCondition(error)) {
          break
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          options.baseDelay * Math.pow(options.backoffFactor, attempt - 1),
          options.maxDelay
        )
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError
  }
}
```

## Testing Service Implementations

### Unit Testing with Mocks:
```typescript
describe('[ServiceName]', () => {
  let service: [ServiceName]
  let mockLogger: jest.Mocked<LoggerContract>
  let mockConfig: ServiceConfiguration
  
  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    }
    
    mockConfig = {
      apiKey: 'test-key',
      baseUrl: 'https://api.test.com',
      timeout: 5000,
      retryAttempts: 3
    }
    
    service = new [ServiceName](mockLogger, mockConfig)
  })
  
  describe('BaseServiceContract', () => {
    it('should implement health check', async () => {
      const health = await service.healthCheck()
      
      expect(health).toHaveProperty('status')
      expect(health).toHaveProperty('timestamp')
      expect(health.checks).toBeInstanceOf(Array)
    })
    
    it('should return capabilities', async () => {
      const capabilities = await service.getCapabilities()
      
      expect(capabilities).toHaveProperty('supportedOperations')
      expect(capabilities).toHaveProperty('limitations')
    })
  })
  
  describe('Contract Implementation', () => {
    it('should validate input correctly', async () => {
      const invalidInput = {} // Invalid input
      
      await expect(service.[specificMethod](invalidInput))
        .rejects
        .toThrow(ServiceError)
    })
    
    it('should handle errors gracefully', async () => {
      // Mock external service to throw error
      jest.spyOn(service, 'performOperation').mockRejectedValue(new Error('API Error'))
      
      await expect(service.[specificMethod](validInput))
        .rejects
        .toThrow(ServiceError)
      
      expect(mockLogger.error).toHaveBeenCalled()
    })
    
    it('should log operations correctly', async () => {
      await service.[specificMethod](validInput)
      
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Starting operation',
        expect.objectContaining({
          operation: '[specificMethod]'
        })
      )
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Operation completed',
        expect.objectContaining({
          operation: '[specificMethod]',
          success: true
        })
      )
    })
  })
})
```

### Integration Testing:
```typescript
describe('[ServiceName] Integration', () => {
  let service: [ServiceName]
  
  beforeAll(async () => {
    // Use test configuration
    const testConfig = getTestConfiguration()
    service = new [ServiceName](testLogger, testConfig)
    await service.initialize()
  })
  
  afterAll(async () => {
    await service.dispose()
  })
  
  it('should handle real API calls', async () => {
    const result = await service.[specificMethod](testInput)
    
    expect(result).toBeDefined()
    expect(result.success).toBe(true)
  })
  
  it('should handle API errors gracefully', async () => {
    // Test with invalid API key or network issues
    const invalidService = new [ServiceName](testLogger, invalidConfig)
    
    await expect(invalidService.[specificMethod](testInput))
      .rejects
      .toThrow(ServiceError)
  })
})
```

## Service Factory Pattern

### Service Registry:
```typescript
export class ServiceRegistry {
  private static instance: ServiceRegistry
  private services: Map<string, BaseServiceContract> = new Map()
  
  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry()
    }
    return ServiceRegistry.instance
  }
  
  register(service: BaseServiceContract): void {
    this.services.set(service.serviceName, service)
  }
  
  get<T extends BaseServiceContract>(serviceName: string): T {
    const service = this.services.get(serviceName)
    if (!service) {
      throw new Error(`Service ${serviceName} not registered`)
    }
    return service as T
  }
  
  async initializeAll(): Promise<void> {
    const initPromises = Array.from(this.services.values())
      .map(service => service.initialize().catch(error => {
        console.error(`Failed to initialize ${service.serviceName}:`, error)
        return Promise.resolve() // Don't fail all if one fails
      }))
    
    await Promise.all(initPromises)
  }
  
  async disposeAll(): Promise<void> {
    const disposePromises = Array.from(this.services.values())
      .map(service => service.dispose().catch(error => {
        console.error(`Failed to dispose ${service.serviceName}:`, error)
        return Promise.resolve()
      }))
    
    await Promise.all(disposePromises)
  }
  
  async healthCheckAll(): Promise<Map<string, ServiceHealth>> {
    const healthChecks = new Map<string, ServiceHealth>()
    
    for (const [name, service] of this.services) {
      try {
        const health = await service.healthCheck()
        healthChecks.set(name, health)
      } catch (error) {
        healthChecks.set(name, {
          status: 'unhealthy',
          timestamp: new Date(),
          checks: [{
            name: 'health_check',
            status: 'unhealthy',
            timestamp: new Date(),
            error: error.message
          }]
        })
      }
    }
    
    return healthChecks
  }
}
```

Remember: Services should be stateless where possible, handle errors consistently, log appropriately, and always validate inputs. They form the critical infrastructure layer that the rest of the application depends on through contracts.
```

This CI/CD automation and custom Copilot instructions will help enforce SDD principles throughout the development lifecycle, ensuring consistent architecture, proper testing, and maintainable code.

#### **2. Voice Synthesis Service Seam**
**Location:** Boundary between story display and voice providers  
**Contract:** `types/voiceSynthesis.ts` - Defines `VoiceOptions`, `SynthesisResult`, provider interfaces  
**Implementation:** Web Speech API, ElevenLabs, Azure TTS with fallback mechanisms

#### **3. Plugin System Seam**
**Location:** Boundary between story display and analytical tools  
**Contract:** `types/pluginSystem.ts` - Defines `Plugin`, `PluginExecutionResult`, plugin registry  
**Implementation:** Extensible plugin architecture for story analysis tools

---

## 🔧 **CONTRACT-FIRST DEVELOPMENT**

### **Central Contract Files**

#### **`types/storyGeneration.ts`**
```typescript
export interface StoryOptions {
  model: AIModel
  genre: Genre
  tone: Tone
  setting: Setting
  characterArchetype: CharacterArchetype
  customPrompt: string
  length: StoryLength
}

export interface StoryResult {
  id: string
  title: string
  content: string
  metadata: StoryMetadata
}

export interface AIStoryService {
  generateStoryStream(options: StoryOptions): AsyncGenerator<string>
  validateOptions(options: StoryOptions): ValidationResult
}
```

#### **`types/voiceSynthesis.ts`**
```typescript
export interface VoiceOptions {
  provider: VoiceProvider
  voiceId: string
  language: string
  settings: VoiceSettings
}

export interface VoiceSynthesisService {
  synthesizeText(text: string, options: VoiceOptions): Promise<AudioData>
  getAvailableVoices(): Promise<VoiceProfile[]>
  previewVoice(options: VoiceOptions, sampleText: string): Promise<AudioData>
}
```

#### **`types/pluginSystem.ts`**
```typescript
export interface Plugin {
  id: string
  name: string
  description: string
  execute: (story: StoryResult) => Promise<PluginExecutionResult>
}

export interface PluginExecutionResult {
  pluginId: string
  data: any
  displayFormat: 'text' | 'chart' | 'table'
}
```

---

## 🧪 **ENHANCED TESTING STRATEGY**

### **Seam-Based Testing Approach**

#### **Unit Tests**
- **Contract Tests:** Validate that implementations adhere to seam contracts
- **Stub Tests:** Test stubbed services simulate correct behavior
- **Plugin Tests:** Test individual plugins in isolation

#### **Integration Tests**
- **Seam Integration:** Test component interactions across seams
- **End-to-End:** Complete user flows with mocked seams
- **Provider Fallback:** Test automatic switching between providers

#### **Testing Tools & Setup**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
```

#### **Mock Strategy**
```typescript
// Example: Mocking AI Service Seam
const mockAIStoryService = {
  generateStoryStream: vi.fn().mockImplementation(async function* () {
    yield 'Once upon a time'
    yield ' in a dark forest...'
    // Simulate streaming
  }),
  validateOptions: vi.fn().mockReturnValue({ valid: true }),
}
```

---

## 🔌 **PLUGIN SYSTEM ARCHITECTURE**

### **Plugin Registry Pattern**

#### **`plugins/pluginRegistry.ts`**
```typescript
import { wordCountPlugin } from './wordCountPlugin'
import { sentimentAnalysisPlugin } from './sentimentAnalysisPlugin'
import { readabilityPlugin } from './readabilityPlugin'

export const pluginRegistry: Plugin[] = [
  wordCountPlugin,
  sentimentAnalysisPlugin,
  readabilityPlugin,
]

export const getPluginById = (id: string): Plugin | undefined => {
  return pluginRegistry.find(plugin => plugin.id === id)
}
```

#### **Example Plugin: Word Count Analysis**
```typescript
export const wordCountPlugin: Plugin = {
  id: 'word-count',
  name: 'Word Count Analysis',
  description: 'Analyze word and character counts',
  execute: async (story: StoryResult) => {
    const wordCount = story.content.split(/\s+/).length
    const charCount = story.content.length
    const readingTime = Math.ceil(wordCount / 200) // 200 words per minute

    return {
      pluginId: 'word-count',
      data: { wordCount, charCount, readingTime },
      displayFormat: 'table',
    }
  },
}
```

### **Plugin UI Integration**
- **Open/Closed Principle:** New plugins added without modifying existing code
- **Lazy Loading:** Plugins loaded on-demand to reduce bundle size
- **Error Boundaries:** Isolated plugin failures don't crash the application

---

## 📁 **ENHANCED FILE STRUCTURE**

```
src/
├── types/                          # Contract definitions (SEAMS)
│   ├── storyGeneration.ts         # AI Generation Service contract
│   ├── voiceSynthesis.ts          # Voice Service contract
│   ├── pluginSystem.ts            # Plugin System contract
│   ├── common.ts                  # Shared types
│   └── index.ts                   # Type exports
├── services/                       # Service implementations
│   ├── ai/
│   │   ├── stubStoryService.ts    # Development stub
│   │   ├── sparkStoryService.ts   # GitHub Spark provider
│   │   └── openAIStoryService.ts  # OpenAI provider
│   ├── voice/
│   │   ├── webSpeechService.ts    # Web Speech API
│   │   ├── elevenLabsService.ts   # ElevenLabs provider
│   │   └── voiceServiceFactory.ts # Provider factory
│   └── index.ts
├── plugins/                        # Plugin system
│   ├── pluginRegistry.ts          # Plugin manifest
│   ├── wordCountPlugin.ts         # Example plugins
│   ├── sentimentAnalysisPlugin.ts
│   └── index.ts
├── features/                       # Feature modules
│   ├── story-generation/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── index.ts
│   │   └── types.ts               # Feature-specific types
│   ├── voice-synthesis/
│   └── story-analysis/
├── shared/                         # Shared modules
│   ├── ui/                        # Reusable components
│   ├── lib/                       # Utilities
│   └── constants/
├── test/                          # Testing infrastructure
│   ├── setup.ts
│   ├── mocks/
│   └── utils/
└── App.tsx
```

---

## 🚀 **DEVELOPMENT WORKFLOW**

### **Contract-First Development Process**

1. **Define Contracts:** Create interfaces in `types/` before implementation
2. **Create Stubs:** Implement stubbed services for development
3. **Build UI Against Contracts:** Components depend only on interfaces
4. **Implement Real Services:** Replace stubs with actual providers
5. **Comprehensive Testing:** Test against contracts, not implementations

### **Seam Testing Workflow**

```typescript
// 1. Test contracts in isolation
describe('AIStoryService Contract', () => {
  it('should generate story stream', async () => {
    const service = new StubStoryService()
    const generator = service.generateStoryStream(mockOptions)
    
    const chunks = []
    for await (const chunk of generator) {
      chunks.push(chunk)
    }
    
    expect(chunks.length).toBeGreaterThan(0)
  })
})

// 2. Test UI with mocked seams
describe('StoryGenerator Component', () => {
  it('should display loading during generation', async () => {
    const mockService = createMockAIStoryService()
    render(<StoryGenerator service={mockService} />)
    
    fireEvent.click(screen.getByText('Generate Story'))
    expect(screen.getByText('Generating...')).toBeInTheDocument()
  })
})
```

---

## 📚 **ENHANCED DOCUMENTATION DELIVERABLES**

### **SEAMS.md**
Document all application seams and their contracts:
- AI Generation Service Seam
- Voice Synthesis Service Seam  
- Plugin System Seam
- Data persistence seams

### **CONTRACTS.md**
Detailed specification of all TypeScript interfaces and their evolution.

### **TESTING_GUIDE.md**
Comprehensive testing strategies for seam-driven development.

### **PLUGIN_DEVELOPMENT.md**
Guide for creating new plugins following the seam contract.

### **LESSONS_LEARNED.md**
Insights from implementing SDD methodology:
- Benefits of contract-first development
- Challenges with seam identification
- Testing improvements with mocked seams

---

## 🎯 **SUCCESS METRICS ENHANCEMENT**

### **Seam-Driven Quality Metrics**
- **Contract Coverage:** 100% of public APIs have contracts
- **Seam Test Coverage:** >95% coverage for seam interactions
- **Stub Accuracy:** Stubs perfectly match production contracts
- **Plugin Compatibility:** New plugins work without code changes

### **Development Velocity Metrics**
- **Time to Feature:** Reduced by 40% with stubbed development
- **Bug Detection:** 60% of integration bugs caught by contract tests
- **Maintenance Effort:** 50% reduction in refactoring time

---

## 📅 **ENHANCED IMPLEMENTATION PLAN**

### **Phase 1: Foundation & Contracts (Weeks 1-2)**
- [ ] Define all seam contracts in `types/`
- [ ] Create stubbed services for development
- [ ] Set up testing infrastructure with seam mocks
- [ ] Implement plugin registry system

### **Phase 2: Core Features with Stubs (Weeks 3-6)**
- [ ] Build UI components against contracts
- [ ] Implement story generation with stubbed AI service
- [ ] Add voice synthesis with stubbed providers
- [ ] Create initial plugin set

### **Phase 3: Real Service Integration (Weeks 7-8)**
- [ ] Replace stubs with real AI providers
- [ ] Integrate actual voice synthesis services
- [ ] Add provider fallback mechanisms
- [ ] Performance optimization

### **Phase 4: Plugin Ecosystem & Polish (Weeks 9-10)**
- [ ] Expand plugin system
- [ ] Comprehensive testing across all seams
- [ ] Documentation completion
- [ ] Production deployment

---

## 💡 **KEY IMPROVEMENTS FROM NARRATIVE NEXUS PRD**

### **Incorporated Elements**
1. **Seam-Driven Development:** Contract-first approach with clear boundaries
2. **Stubbed Services:** Development without real API dependencies
3. **Plugin System:** Extensible architecture for story analysis tools
4. **Detailed Testing Strategy:** Mocking seams for isolated testing
5. **Specific Documentation:** SEAMS.md, LESSONS_LEARNED.md, etc.

### **Enhanced Benefits**
- **Faster Development:** Build and test UI without waiting for API integrations
- **Better Testability:** Components tested in complete isolation
- **True Modularity:** Services can be swapped without touching UI code
- **Extensibility:** New features added through plugins without core changes

---

This enhanced PRD combines the comprehensive architecture of the original with the powerful SDD methodology from Narrative Nexus, creating a superior foundation for maintainable, testable, and extensible software development.</content>
<parameter name="filePath">/workspaces/darkstory-generator/PRD_V2.1_SEAM_DRIVEN.md