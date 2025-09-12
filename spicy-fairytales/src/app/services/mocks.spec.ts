/**
 * Unit tests for mock service implementations used in development and testing.
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
