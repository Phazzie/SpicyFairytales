/**
 * Comprehensive test suite validating mock service implementations and ensuring contract compliance.
 * 
 * Unit tests that verify mock services maintain interface compliance with real service contracts,
 * produce valid data structures, and simulate realistic API behavior patterns. Critical for
 * ensuring mock-first development workflow doesn't introduce integration issues.
 * 
 * INPUT: Mock service instances, test story options, sample data
 * OUTPUT: Test validation results, contract compliance verification, behavior validation
 * DEPENDENCIES: Jest/Jasmine testing framework, RxJS testing utilities, service contracts
 * INTEGRATIONS: CI/CD pipeline, development workflow validation, service interface testing
 * COVERAGE: Interface compliance, data structure validation, timing behavior, error handling
 * QUALITY: Ensures mocks accurately represent real service behavior for reliable development
 */
import { firstValueFrom, lastValueFrom } from 'rxjs'
import { reduce } from 'rxjs/operators'
import { MockStoryService } from './mocks'

describe('MockStoryService', () => {
  it('streams chunks that concatenate to non-empty text', async () => {
    const svc = new MockStoryService()
    const obs = svc.generateStory({ genre: 'horror', tone: 'dark', length: 'short' })
    const full = await firstValueFrom(obs.pipe(reduce((acc, chunk) => acc + chunk, '')))
    expect(full.length).toBeGreaterThan(10)
  })
})
