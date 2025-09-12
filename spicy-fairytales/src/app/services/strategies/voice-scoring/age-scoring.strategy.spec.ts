import { AgeScoringStrategy } from './age-scoring.strategy'
import { Voice, CharacterTraits } from '../../../shared/contracts'

describe('AgeScoringStrategy', () => {
  let strategy: AgeScoringStrategy

  beforeEach(() => {
    strategy = new AgeScoringStrategy()
  })

  describe('score method', () => {
    it('should return 3 for child character with young voice', () => {
      const voice: Voice = { id: '1', name: 'Young Voice' }
      const character: CharacterTraits = {
        name: 'Timmy',
        age: 'child'
      }

      const score = strategy.score(voice, character)
      expect(score).toBe(3)
    })

    it('should return 3 for elderly character with old voice', () => {
      const voice: Voice = { id: '2', name: 'Old Voice' }
      const character: CharacterTraits = {
        name: 'Grandma',
        age: 'elderly'
      }

      const score = strategy.score(voice, character)
      expect(score).toBe(3)
    })

    it('should return 2 for teen character with young voice', () => {
      const voice: Voice = { id: '3', name: 'Young Voice' }
      const character: CharacterTraits = {
        name: 'Teenager',
        age: 'teen'
      }

      const score = strategy.score(voice, character)
      expect(score).toBe(2)
    })

    it('should return 1 for adult character with any voice', () => {
      const voice: Voice = { id: '4', name: 'Any Voice' }
      const character: CharacterTraits = {
        name: 'Adult',
        age: 'adult'
      }

      const score = strategy.score(voice, character)
      expect(score).toBe(1)
    })

    it('should return 0 when character has no age specified', () => {
      const voice: Voice = { id: '5', name: 'Any Voice' }
      const character: CharacterTraits = {
        name: 'Unknown Age'
      }

      const score = strategy.score(voice, character)
      expect(score).toBe(0)
    })

    it('should return 0 for child character with non-young voice', () => {
      const voice: Voice = { id: '6', name: 'Deep Voice' }
      const character: CharacterTraits = {
        name: 'Child',
        age: 'child'
      }

      const score = strategy.score(voice, character)
      expect(score).toBe(0)
    })

    it('should return 0 for elderly character with non-old voice', () => {
      const voice: Voice = { id: '7', name: 'Young Voice' }
      const character: CharacterTraits = {
        name: 'Elderly',
        age: 'elderly'
      }

      const score = strategy.score(voice, character)
      expect(score).toBe(0)
    })

    it('should be case insensitive for voice name matching', () => {
      const voice: Voice = { id: '8', name: 'YOUNG VOICE' }
      const character: CharacterTraits = {
        name: 'Child',
        age: 'child'
      }

      const score = strategy.score(voice, character)
      expect(score).toBe(3)
    })

    it('should handle middle-aged characters', () => {
      const voice: Voice = { id: '9', name: 'Any Voice' }
      const character: CharacterTraits = {
        name: 'Middle-aged',
        age: 'middle-aged'
      }

      const score = strategy.score(voice, character)
      expect(score).toBe(1)
    })

    it('should handle young-adult characters', () => {
      const voice: Voice = { id: '10', name: 'Any Voice' }
      const character: CharacterTraits = {
        name: 'Young Adult',
        age: 'young-adult'
      }

      const score = strategy.score(voice, character)
      expect(score).toBe(1)
    })
  })

  describe('getReasoning method', () => {
    it('should provide reasoning for child character with young voice match', () => {
      const voice: Voice = { id: '1', name: 'Young Voice' }
      const character: CharacterTraits = {
        name: 'Timmy',
        age: 'child'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toContain('Young Voice has a youthful tone suitable for children')
    })

    it('should provide reasoning for elderly character with old voice match', () => {
      const voice: Voice = { id: '2', name: 'Old Voice' }
      const character: CharacterTraits = {
        name: 'Grandma',
        age: 'elderly'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toContain('Old Voice has a mature tone suitable for elderly characters')
    })

    it('should provide reasoning for teen character with young voice match', () => {
      const voice: Voice = { id: '3', name: 'Young Voice' }
      const character: CharacterTraits = {
        name: 'Teenager',
        age: 'teen'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toContain('Young Voice has a youthful tone suitable for teenagers')
    })

    it('should provide reasoning for adult character with any voice', () => {
      const voice: Voice = { id: '4', name: 'Any Voice' }
      const character: CharacterTraits = {
        name: 'Adult',
        age: 'adult'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toContain('Any Voice is suitable for adult characters')
    })

    it('should provide reasoning when no age is specified', () => {
      const voice: Voice = { id: '5', name: 'Any Voice' }
      const character: CharacterTraits = {
        name: 'Unknown Age'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toBe('No age information available')
    })

    it('should provide reasoning for child character with non-matching voice', () => {
      const voice: Voice = { id: '6', name: 'Deep Voice' }
      const character: CharacterTraits = {
        name: 'Child',
        age: 'child'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toContain('Deep Voice may not be ideal for child characters')
    })

    it('should handle case insensitive voice name matching in reasoning', () => {
      const voice: Voice = { id: '7', name: 'YOUNG VOICE' }
      const character: CharacterTraits = {
        name: 'Child',
        age: 'child'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toContain('YOUNG VOICE has a youthful tone suitable for children')
    })
  })
})