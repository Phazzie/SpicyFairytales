import { GenderScoringStrategy } from './gender-scoring.strategy'
import { Voice, CharacterTraits } from '../../../shared/contracts'

describe('GenderScoringStrategy', () => {
  let strategy: GenderScoringStrategy

  beforeEach(() => {
    strategy = new GenderScoringStrategy()
  })

  describe('score method', () => {
    describe('male characters', () => {
      it('should return 2 for male character with "male" voice', () => {
        const voice: Voice = { id: '1', name: 'Male Voice' }
        const character: CharacterTraits = {
          name: 'John',
          gender: 'male'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(2)
      })

      it('should return 2 for male character with "deep" voice', () => {
        const voice: Voice = { id: '2', name: 'Deep Voice' }
        const character: CharacterTraits = {
          name: 'David',
          gender: 'male'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(2)
      })

      it('should return 0 for male character with non-male voice', () => {
        const voice: Voice = { id: '3', name: 'Soprano Voice' }
        const character: CharacterTraits = {
          name: 'Mike',
          gender: 'male'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(0)
      })
    })

    describe('female characters', () => {
      it('should return 2 for female character with "female" voice', () => {
        const voice: Voice = { id: '4', name: 'Female Voice' }
        const character: CharacterTraits = {
          name: 'Jane',
          gender: 'female'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(2)
      })

      it('should return 2 for female character with "bella" voice', () => {
        const voice: Voice = { id: '5', name: 'Bella Voice' }
        const character: CharacterTraits = {
          name: 'Sarah',
          gender: 'female'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(2)
      })

      it('should return 0 for female character with non-female voice', () => {
        const voice: Voice = { id: '6', name: 'Bass Voice' }
        const character: CharacterTraits = {
          name: 'Emma',
          gender: 'female'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(0)
      })
    })

    describe('neutral characters', () => {
      it('should return 1 for neutral character with any voice', () => {
        const voice: Voice = { id: '7', name: 'Random Voice' }
        const character: CharacterTraits = {
          name: 'Alex',
          gender: 'neutral'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(1)
      })

      it('should return 1 for neutral character with male voice', () => {
        const voice: Voice = { id: '8', name: 'Male Voice' }
        const character: CharacterTraits = {
          name: 'Casey',
          gender: 'neutral'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(1)
      })

      it('should return 1 for neutral character with female voice', () => {
        const voice: Voice = { id: '9', name: 'Female Voice' }
        const character: CharacterTraits = {
          name: 'Jordan',
          gender: 'neutral'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(1)
      })
    })

    describe('edge cases', () => {
      it('should return 0 when character has no gender specified', () => {
        const voice: Voice = { id: '10', name: 'Any Voice' }
        const character: CharacterTraits = {
          name: 'Unknown'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(0)
      })

      it('should be case insensitive for voice name matching', () => {
        const voice: Voice = { id: '11', name: 'MALE VOICE' }
        const character: CharacterTraits = {
          name: 'Tom',
          gender: 'male'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(2)
      })

      it('should be case insensitive for "deep" voice matching', () => {
        const voice: Voice = { id: '12', name: 'DEEP VOICE' }
        const character: CharacterTraits = {
          name: 'Bob',
          gender: 'male'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(2)
      })

      it('should be case insensitive for "bella" voice matching', () => {
        const voice: Voice = { id: '13', name: 'BELLA VOICE' }
        const character: CharacterTraits = {
          name: 'Maria',
          gender: 'female'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(2)
      })

      it('should return 0 for unknown gender', () => {
        const voice: Voice = { id: '14', name: 'Any Voice' }
        const character: CharacterTraits = {
          name: 'Unknown',
          gender: 'unknown' as any // Type assertion for test
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(0)
      })
    })
  })

  describe('getReasoning method', () => {
    it('should return appropriate reasoning for male character with male voice', () => {
      const voice: Voice = { id: '1', name: 'Male Voice' }
      const character: CharacterTraits = {
        name: 'John',
        gender: 'male'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toBe('Male Voice has a masculine tone suitable for male characters')
    })

    it('should return appropriate reasoning for male character with deep voice', () => {
      const voice: Voice = { id: '2', name: 'Deep Voice' }
      const character: CharacterTraits = {
        name: 'David',
        gender: 'male'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toBe('Deep Voice has a masculine tone suitable for male characters')
    })

    it('should return appropriate reasoning for male character with non-male voice', () => {
      const voice: Voice = { id: '3', name: 'High Voice' }
      const character: CharacterTraits = {
        name: 'Mike',
        gender: 'male'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toBe('High Voice may not be ideal for male characters')
    })

    it('should return appropriate reasoning for female character with female voice', () => {
      const voice: Voice = { id: '4', name: 'Female Voice' }
      const character: CharacterTraits = {
        name: 'Jane',
        gender: 'female'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toBe('Female Voice has a feminine tone suitable for female characters')
    })

    it('should return appropriate reasoning for female character with bella voice', () => {
      const voice: Voice = { id: '5', name: 'Bella Voice' }
      const character: CharacterTraits = {
        name: 'Sarah',
        gender: 'female'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toBe('Bella Voice has a feminine tone suitable for female characters')
    })

    it('should return appropriate reasoning for female character with non-female voice', () => {
      const voice: Voice = { id: '6', name: 'Bass Voice' }
      const character: CharacterTraits = {
        name: 'Emma',
        gender: 'female'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toBe('Bass Voice may not be ideal for female characters')
    })

    it('should return appropriate reasoning for neutral character', () => {
      const voice: Voice = { id: '7', name: 'Neutral Voice' }
      const character: CharacterTraits = {
        name: 'Alex',
        gender: 'neutral'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toBe('Neutral Voice works well for gender-neutral characters')
    })

    it('should return no gender info message when character has no gender', () => {
      const voice: Voice = { id: '8', name: 'Any Voice' }
      const character: CharacterTraits = {
        name: 'Unknown'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toBe('No gender information available')
    })

    it('should handle unknown gender gracefully', () => {
      const voice: Voice = { id: '9', name: 'Any Voice' }
      const character: CharacterTraits = {
        name: 'Unknown',
        gender: 'other' as any // Type assertion for test
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toBe('Any Voice is suitable for other characters')
    })
  })
})