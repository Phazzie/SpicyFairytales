import { StoryNarratorScoringStrategy } from './story-narrator-scoring.strategy'
import { Voice, StoryAnalysis } from '../../../shared/contracts'

describe('StoryNarratorScoringStrategy', () => {
  let strategy: StoryNarratorScoringStrategy

  beforeEach(() => {
    strategy = new StoryNarratorScoringStrategy()
  })

  describe('score method', () => {
    describe('tone matching', () => {
      it('should return 1 for formal story with formal voice', () => {
        const voice: Voice = { id: '1', name: 'Formal Voice' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'formal',
          genre: ['drama'],
          length: 'medium',
          wordCount: 500
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(1)
      })

      it('should return 1 for formal story with professional voice', () => {
        const voice: Voice = { id: '2', name: 'Professional Voice' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'formal',
          genre: ['drama'],
          length: 'medium',
          wordCount: 500
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(1)
      })

      it('should return 1 for casual story with casual voice', () => {
        const voice: Voice = { id: '3', name: 'Casual Voice' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'casual',
          genre: ['comedy'],
          length: 'medium',
          wordCount: 500
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(1)
      })

      it('should return 1 for casual story with friendly voice', () => {
        const voice: Voice = { id: '4', name: 'Friendly Voice' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'casual',
          genre: ['comedy'],
          length: 'medium',
          wordCount: 500
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(1)
      })

      it('should return 1 for dramatic story with dramatic voice', () => {
        const voice: Voice = { id: '5', name: 'Dramatic Voice' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'dramatic',
          genre: ['thriller'],
          length: 'medium',
          wordCount: 500
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(1)
      })

      it('should return 1 for dramatic story with deep voice', () => {
        const voice: Voice = { id: '6', name: 'Deep Voice' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'dramatic',
          genre: ['thriller'],
          length: 'medium',
          wordCount: 500
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(1)
      })

      it('should return 1 for whimsical story with whimsical voice', () => {
        const voice: Voice = { id: '7', name: 'Whimsical Voice' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'whimsical',
          genre: ['fantasy'],
          length: 'medium',
          wordCount: 500
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(1)
      })

      it('should return 1 for whimsical story with light voice', () => {
        const voice: Voice = { id: '8', name: 'Light Voice' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'whimsical',
          genre: ['fantasy'],
          length: 'medium',
          wordCount: 500
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(1)
      })

      it('should return 0 for tone mismatch', () => {
        const voice: Voice = { id: '9', name: 'Random Voice' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'formal',
          genre: ['drama'],
          length: 'medium',
          wordCount: 500
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(0)
      })
    })

    describe('length consideration', () => {
      it('should add 0.5 for long story with calm voice', () => {
        const voice: Voice = { id: '10', name: 'Calm Voice' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'neutral' as any, // Type assertion for test
          genre: ['drama'],
          length: 'long',
          wordCount: 2000
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(0.5)
      })

      it('should add 0.5 for short story with engaging voice', () => {
        const voice: Voice = { id: '11', name: 'Engaging Voice' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'neutral' as any, // Type assertion for test
          genre: ['drama'],
          length: 'short',
          wordCount: 200
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(0.5)
      })

      it('should combine tone and length bonuses', () => {
        const voice: Voice = { id: '12', name: 'Formal Calm Voice' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'formal',
          genre: ['drama'],
          length: 'long',
          wordCount: 2000
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(1) // 1 (formal) + 0.5 (calm) = 1.5, capped at 1
      })
    })

    describe('genre consideration', () => {
      it('should add 0.3 for horror story with mysterious voice', () => {
        const voice: Voice = { id: '13', name: 'Mysterious Voice' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'neutral' as any, // Type assertion for test
          genre: ['horror'],
          length: 'medium',
          wordCount: 500
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(0.3)
      })

      it('should add 0.3 for romance story with warm voice', () => {
        const voice: Voice = { id: '14', name: 'Warm Voice' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'neutral' as any, // Type assertion for test
          genre: ['romance'],
          length: 'medium',
          wordCount: 500
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(0.3)
      })

      it('should combine tone and genre bonuses', () => {
        const voice: Voice = { id: '15', name: 'Dramatic Mysterious Voice' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'dramatic',
          genre: ['horror'],
          length: 'medium',
          wordCount: 500
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(1) // 1 (dramatic) + 0.3 (mysterious) = 1.3, capped at 1
      })
    })

    describe('edge cases', () => {
      it('should be case insensitive for voice name matching', () => {
        const voice: Voice = { id: '16', name: 'FORMAL VOICE' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'formal',
          genre: ['drama'],
          length: 'medium',
          wordCount: 500
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(1)
      })

      it('should cap maximum score at 1.0', () => {
        const voice: Voice = { id: '17', name: 'Formal Calm Mysterious Voice' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'formal',
          genre: ['horror'],
          length: 'long',
          wordCount: 2000
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(1) // 1 + 0.5 + 0.3 = 1.8, capped at 1
      })

      it('should handle multiple genres correctly', () => {
        const voice: Voice = { id: '18', name: 'Warm Voice' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'neutral' as any, // Type assertion for test
          genre: ['romance', 'comedy'],
          length: 'medium',
          wordCount: 500
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(0.3) // Should match romance genre
      })

      it('should return 0 for completely unmatched voice', () => {
        const voice: Voice = { id: '19', name: 'Random Voice' }
        const storyAnalysis: StoryAnalysis = {
          tone: 'neutral' as any, // Type assertion for test
          genre: ['adventure'],
          length: 'medium',
          wordCount: 500
        }

        const score = strategy.score(voice, storyAnalysis)
        expect(score).toBe(0)
      })
    })
  })

  describe('getReasoning method', () => {
    it('should return appropriate reasoning for formal tone match', () => {
      const voice: Voice = { id: '1', name: 'Formal Voice' }
      const storyAnalysis: StoryAnalysis = {
        tone: 'formal',
        genre: ['drama'],
        length: 'medium',
        wordCount: 500
      }

      const reasoning = strategy.getReasoning(voice, storyAnalysis)
      expect(reasoning).toBe('Formal Voice is recommended because it has a formal tone matches the story\'s formal style')
    })

    it('should return appropriate reasoning for casual tone match', () => {
      const voice: Voice = { id: '2', name: 'Casual Voice' }
      const storyAnalysis: StoryAnalysis = {
        tone: 'casual',
        genre: ['comedy'],
        length: 'medium',
        wordCount: 500
      }

      const reasoning = strategy.getReasoning(voice, storyAnalysis)
      expect(reasoning).toBe('Casual Voice is recommended because it has a casual tone matches the story\'s casual style')
    })

    it('should return appropriate reasoning for dramatic tone match', () => {
      const voice: Voice = { id: '3', name: 'Dramatic Voice' }
      const storyAnalysis: StoryAnalysis = {
        tone: 'dramatic',
        genre: ['thriller'],
        length: 'medium',
        wordCount: 500
      }

      const reasoning = strategy.getReasoning(voice, storyAnalysis)
      expect(reasoning).toBe('Dramatic Voice is recommended because it has a dramatic tone enhances the story\'s dramatic elements')
    })

    it('should return appropriate reasoning for whimsical tone match', () => {
      const voice: Voice = { id: '4', name: 'Whimsical Voice' }
      const storyAnalysis: StoryAnalysis = {
        tone: 'whimsical',
        genre: ['fantasy'],
        length: 'medium',
        wordCount: 500
      }

      const reasoning = strategy.getReasoning(voice, storyAnalysis)
      expect(reasoning).toBe('Whimsical Voice is recommended because it has a whimsical tone complements the story\'s playful nature')
    })

    it('should include length reasoning for long stories with calm voice', () => {
      const voice: Voice = { id: '5', name: 'Calm Voice' }
      const storyAnalysis: StoryAnalysis = {
        tone: 'neutral' as any, // Type assertion for test
        genre: ['drama'],
        length: 'long',
        wordCount: 2000
      }

      const reasoning = strategy.getReasoning(voice, storyAnalysis)
      expect(reasoning).toBe('Calm Voice is recommended because it has a calm delivery is ideal for longer stories')
    })

    it('should include length reasoning for short stories with engaging voice', () => {
      const voice: Voice = { id: '6', name: 'Engaging Voice' }
      const storyAnalysis: StoryAnalysis = {
        tone: 'neutral' as any, // Type assertion for test
        genre: ['drama'],
        length: 'short',
        wordCount: 200
      }

      const reasoning = strategy.getReasoning(voice, storyAnalysis)
      expect(reasoning).toBe('Engaging Voice is recommended because it has a engaging delivery suits shorter stories')
    })

    it('should include genre reasoning for horror with mysterious voice', () => {
      const voice: Voice = { id: '7', name: 'Mysterious Voice' }
      const storyAnalysis: StoryAnalysis = {
        tone: 'neutral' as any, // Type assertion for test
        genre: ['horror'],
        length: 'medium',
        wordCount: 500
      }

      const reasoning = strategy.getReasoning(voice, storyAnalysis)
      expect(reasoning).toBe('Mysterious Voice is recommended because it has a mysterious tone enhances horror elements')
    })

    it('should include genre reasoning for romance with warm voice', () => {
      const voice: Voice = { id: '8', name: 'Warm Voice' }
      const storyAnalysis: StoryAnalysis = {
        tone: 'neutral' as any, // Type assertion for test
        genre: ['romance'],
        length: 'medium',
        wordCount: 500
      }

      const reasoning = strategy.getReasoning(voice, storyAnalysis)
      expect(reasoning).toBe('Warm Voice is recommended because it has a warm tone complements romantic themes')
    })

    it('should combine multiple reasoning factors', () => {
      const voice: Voice = { id: '9', name: 'Formal Calm Voice' }
      const storyAnalysis: StoryAnalysis = {
        tone: 'formal',
        genre: ['drama'],
        length: 'long',
        wordCount: 2000
      }

      const reasoning = strategy.getReasoning(voice, storyAnalysis)
      expect(reasoning).toBe('Formal Calm Voice is recommended because it has a formal tone matches the story\'s formal style and calm delivery is ideal for longer stories')
    })

    it('should return default message when no specific matches found', () => {
      const voice: Voice = { id: '10', name: 'Random Voice' }
      const storyAnalysis: StoryAnalysis = {
        tone: 'neutral' as any, // Type assertion for test
        genre: ['adventure'],
        length: 'medium',
        wordCount: 500
      }

      const reasoning = strategy.getReasoning(voice, storyAnalysis)
      expect(reasoning).toBe('Random Voice is a suitable narrator voice for this story')
    })
  })
})