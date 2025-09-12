import { RoleScoringStrategy } from './role-scoring.strategy'
import { Voice, CharacterTraits } from '../../../shared/contracts'

describe('RoleScoringStrategy', () => {
  let strategy: RoleScoringStrategy

  beforeEach(() => {
    strategy = new RoleScoringStrategy()
  })

  describe('score method', () => {
    describe('protagonist characters', () => {
      it('should return 1 for protagonist with confident voice', () => {
        const voice: Voice = { id: '1', name: 'Confident Voice' }
        const character: CharacterTraits = {
          name: 'Hero',
          role: 'protagonist'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(1)
      })

      it('should return 1 for protagonist with strong voice', () => {
        const voice: Voice = { id: '2', name: 'Strong Voice' }
        const character: CharacterTraits = {
          name: 'Champion',
          role: 'protagonist'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(1)
      })

      it('should return 0 for protagonist with non-confident voice', () => {
        const voice: Voice = { id: '3', name: 'Weak Voice' }
        const character: CharacterTraits = {
          name: 'Hero',
          role: 'protagonist'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(0)
      })
    })

    describe('antagonist/villain characters', () => {
      it('should return 1 for antagonist with deep voice', () => {
        const voice: Voice = { id: '4', name: 'Deep Voice' }
        const character: CharacterTraits = {
          name: 'Villain',
          role: 'antagonist'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(1)
      })

      it('should return 1 for villain with dark voice', () => {
        const voice: Voice = { id: '5', name: 'Dark Voice' }
        const character: CharacterTraits = {
          name: 'Evil Queen',
          role: 'villain'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(1)
      })

      it('should return 0 for antagonist with non-deep voice', () => {
        const voice: Voice = { id: '6', name: 'Light Voice' }
        const character: CharacterTraits = {
          name: 'Villain',
          role: 'antagonist'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(0)
      })
    })

    describe('mentor characters', () => {
      it('should return 1 for mentor with wise voice', () => {
        const voice: Voice = { id: '7', name: 'Wise Voice' }
        const character: CharacterTraits = {
          name: 'Gandalf',
          role: 'mentor'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(1)
      })

      it('should return 1 for mentor with calm voice', () => {
        const voice: Voice = { id: '8', name: 'Calm Voice' }
        const character: CharacterTraits = {
          name: 'Master Yoda',
          role: 'mentor'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(1)
      })

      it('should return 0 for mentor with non-wise voice', () => {
        const voice: Voice = { id: '9', name: 'Excited Voice' }
        const character: CharacterTraits = {
          name: 'Teacher',
          role: 'mentor'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(0)
      })
    })

    describe('sidekick characters', () => {
      it('should return 1 for sidekick with friendly voice', () => {
        const voice: Voice = { id: '10', name: 'Friendly Voice' }
        const character: CharacterTraits = {
          name: 'Robin',
          role: 'sidekick'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(1)
      })

      it('should return 1 for sidekick with warm voice', () => {
        const voice: Voice = { id: '11', name: 'Warm Voice' }
        const character: CharacterTraits = {
          name: 'Companion',
          role: 'sidekick'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(1)
      })

      it('should return 0 for sidekick with non-friendly voice', () => {
        const voice: Voice = { id: '12', name: 'Cold Voice' }
        const character: CharacterTraits = {
          name: 'Helper',
          role: 'sidekick'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(0)
      })
    })

    describe('neutral and edge cases', () => {
      it('should return 0 for neutral role', () => {
        const voice: Voice = { id: '13', name: 'Any Voice' }
        const character: CharacterTraits = {
          name: 'Bystander',
          role: 'neutral'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(0)
      })

      it('should return 0 when character has no role specified', () => {
        const voice: Voice = { id: '14', name: 'Any Voice' }
        const character: CharacterTraits = {
          name: 'Unknown'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(0)
      })

      it('should be case insensitive for voice name matching', () => {
        const voice: Voice = { id: '15', name: 'CONFIDENT VOICE' }
        const character: CharacterTraits = {
          name: 'Hero',
          role: 'protagonist'
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(1)
      })

      it('should return 0 for unknown role', () => {
        const voice: Voice = { id: '16', name: 'Any Voice' }
        const character: CharacterTraits = {
          name: 'Unknown',
          role: 'unknown' as any // Type assertion for test
        }

        const score = strategy.score(voice, character)
        expect(score).toBe(0)
      })
    })
  })

  describe('getReasoning method', () => {
    it('should return appropriate reasoning for protagonist with confident voice', () => {
      const voice: Voice = { id: '1', name: 'Confident Voice' }
      const character: CharacterTraits = {
        name: 'Hero',
        role: 'protagonist'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toBe('Confident Voice has a confident tone suitable for protagonists')
    })

    it('should return appropriate reasoning for protagonist with strong voice', () => {
      const voice: Voice = { id: '2', name: 'Strong Voice' }
      const character: CharacterTraits = {
        name: 'Champion',
        role: 'protagonist'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toBe('Strong Voice has a confident tone suitable for protagonists')
    })

    it('should return fallback reasoning for protagonist with non-matching voice', () => {
      const voice: Voice = { id: '3', name: 'Weak Voice' }
      const character: CharacterTraits = {
        name: 'Hero',
        role: 'protagonist'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toBe('Weak Voice is acceptable for protagonist characters')
    })

    it('should return appropriate reasoning for villain with deep voice', () => {
      const voice: Voice = { id: '4', name: 'Deep Voice' }
      const character: CharacterTraits = {
        name: 'Villain',
        role: 'villain'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toBe('Deep Voice has a deep tone suitable for villains')
    })

    it('should return appropriate reasoning for mentor with wise voice', () => {
      const voice: Voice = { id: '5', name: 'Wise Voice' }
      const character: CharacterTraits = {
        name: 'Gandalf',
        role: 'mentor'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toBe('Wise Voice has a wise tone suitable for mentors')
    })

    it('should return appropriate reasoning for sidekick with friendly voice', () => {
      const voice: Voice = { id: '6', name: 'Friendly Voice' }
      const character: CharacterTraits = {
        name: 'Robin',
        role: 'sidekick'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toBe('Friendly Voice has a friendly tone suitable for sidekicks')
    })

    it('should return no role info message when character has no role', () => {
      const voice: Voice = { id: '7', name: 'Any Voice' }
      const character: CharacterTraits = {
        name: 'Unknown'
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toBe('No role information available')
    })

    it('should handle unknown role gracefully', () => {
      const voice: Voice = { id: '8', name: 'Any Voice' }
      const character: CharacterTraits = {
        name: 'Unknown',
        role: 'custom' as any // Type assertion for test
      }

      const reasoning = strategy.getReasoning(voice, character)
      expect(reasoning).toBe('Any Voice is suitable for custom characters')
    })
  })
})