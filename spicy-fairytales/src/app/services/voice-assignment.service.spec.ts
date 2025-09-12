import { TestBed } from '@angular/core/testing'
import { VoiceAssignmentService, CharacterTraits, VoiceRecommendation } from './voice-assignment.service'
import { VoiceStore } from '../stores/voice.store'
import {
  AGE_SCORING_STRATEGY,
  GENDER_SCORING_STRATEGY,
  ROLE_SCORING_STRATEGY,
  NARRATOR_SCORING_STRATEGY,
  SPEAKER_PARSER
} from '../shared/tokens'
import { Voice, ParsedStory, VoiceScoringStrategy, NarratorScoringStrategy, StoryAnalysis } from '../shared/contracts'

describe('VoiceAssignmentService', () => {
  let service: VoiceAssignmentService
  let mockVoiceStore: jasmine.SpyObj<VoiceStore>
  let mockAgeStrategy: jasmine.SpyObj<VoiceScoringStrategy>
  let mockGenderStrategy: jasmine.SpyObj<VoiceScoringStrategy>
  let mockRoleStrategy: jasmine.SpyObj<VoiceScoringStrategy>
  let mockNarratorStrategy: jasmine.SpyObj<NarratorScoringStrategy>
  let mockParser: jasmine.SpyObj<any>

  const mockVoices: Voice[] = [
    { id: '1', name: 'Young Male Voice' },
    { id: '2', name: 'Old Female Voice' },
    { id: '3', name: 'Deep Confident Voice' },
    { id: '4', name: 'Friendly Warm Voice' }
  ]

  const mockParsedStory: ParsedStory = {
    characters: [
      { name: 'Young Hero Prince Bob', appearances: 5 }, // Will trigger 'young' age + 'prince' gender + 'hero' role
      { name: 'Evil Villain Princess Emma', appearances: 3 } // Will trigger 'princess' gender + 'villain' role
    ],
    segments: [
      { type: 'narration', text: 'Once upon a time...', character: undefined },
      { type: 'dialogue', text: 'I will save the day!', character: 'Young Hero Prince Bob' },
      { type: 'dialogue', text: 'You will fail!', character: 'Evil Villain Princess Emma' }
    ]
  }

  beforeEach(() => {
    const voiceStoreSpy = jasmine.createSpyObj('VoiceStore', ['voices'])
    const ageStrategySpy = jasmine.createSpyObj('VoiceScoringStrategy', ['score', 'getReasoning'])
    const genderStrategySpy = jasmine.createSpyObj('VoiceScoringStrategy', ['score', 'getReasoning'])
    const roleStrategySpy = jasmine.createSpyObj('VoiceScoringStrategy', ['score', 'getReasoning'])
    const narratorStrategySpy = jasmine.createSpyObj('NarratorScoringStrategy', ['score', 'getReasoning'])
    const parserSpy = jasmine.createSpyObj('Parser', ['parseStory'])

    TestBed.configureTestingModule({
      providers: [
        VoiceAssignmentService,
        { provide: VoiceStore, useValue: voiceStoreSpy },
        { provide: AGE_SCORING_STRATEGY, useValue: ageStrategySpy },
        { provide: GENDER_SCORING_STRATEGY, useValue: genderStrategySpy },
        { provide: ROLE_SCORING_STRATEGY, useValue: roleStrategySpy },
        { provide: NARRATOR_SCORING_STRATEGY, useValue: narratorStrategySpy },
        { provide: SPEAKER_PARSER, useValue: parserSpy }
      ]
    })

    service = TestBed.inject(VoiceAssignmentService)
    mockVoiceStore = TestBed.inject(VoiceStore) as jasmine.SpyObj<VoiceStore>
    mockAgeStrategy = TestBed.inject(AGE_SCORING_STRATEGY) as jasmine.SpyObj<VoiceScoringStrategy>
    mockGenderStrategy = TestBed.inject(GENDER_SCORING_STRATEGY) as jasmine.SpyObj<VoiceScoringStrategy>
    mockRoleStrategy = TestBed.inject(ROLE_SCORING_STRATEGY) as jasmine.SpyObj<VoiceScoringStrategy>
    mockNarratorStrategy = TestBed.inject(NARRATOR_SCORING_STRATEGY) as jasmine.SpyObj<NarratorScoringStrategy>
    mockParser = TestBed.inject(SPEAKER_PARSER) as jasmine.SpyObj<any>

    // Setup default mock behaviors
    mockVoiceStore.voices.and.returnValue(mockVoices)
    mockParser.parseStory.and.returnValue(Promise.resolve(mockParsedStory))
    
    // Default strategy scores
    mockAgeStrategy.score.and.returnValue(0.5)
    mockAgeStrategy.getReasoning.and.returnValue('Age reasoning')
    mockGenderStrategy.score.and.returnValue(0.7)
    mockGenderStrategy.getReasoning.and.returnValue('Gender reasoning')
    mockRoleStrategy.score.and.returnValue(0.8)
    mockRoleStrategy.getReasoning.and.returnValue('Role reasoning')
    mockNarratorStrategy.score.and.returnValue(0.9)
    mockNarratorStrategy.getReasoning.and.returnValue('Narrator reasoning')
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('generateSmartAssignments', () => {
    it('should generate recommendations for all characters in the story', async () => {
      const storyText = 'Once upon a time, a brave hero fought an evil villain.'
      
      const recommendations = await service.generateSmartAssignments(storyText)
      
      expect(recommendations).toHaveSize(2)
      expect(recommendations[0].character).toBe('Young Hero Prince Bob')
      expect(recommendations[1].character).toBe('Evil Villain Princess Emma')
      expect(mockParser.parseStory).toHaveBeenCalledWith(storyText)
    })

    it('should handle empty character list gracefully', async () => {
      const emptyParsedStory: ParsedStory = {
        characters: [],
        segments: []
      }
      mockParser.parseStory.and.returnValue(Promise.resolve(emptyParsedStory))
      
      const recommendations = await service.generateSmartAssignments('Empty story')
      
      expect(recommendations).toHaveSize(0)
    })

    it('should return no voice recommendation when no voices available', async () => {
      mockVoiceStore.voices.and.returnValue([])
      
      const recommendations = await service.generateSmartAssignments('Test story')
      
      expect(recommendations[0].recommendedVoiceId).toBe('')
      expect(recommendations[0].confidence).toBe(0)
      expect(recommendations[0].reasoning).toBe('No voices available')
    })
  })

  describe('voice scoring with strategies', () => {
    it('should combine all strategy scores with proper weighting', async () => {
      // Setup strategy scores: age=1, gender=2, role=1
      mockAgeStrategy.score.and.returnValue(1)
      mockGenderStrategy.score.and.returnValue(2)
      mockRoleStrategy.score.and.returnValue(1)
      
      const recommendations = await service.generateSmartAssignments('Test story')
      
      // Expected calculation: (1*4 + 2*3 + 1*3) / (4+3+3) * 10 = 13/10 * 10 = 13 (capped at 10)
      // This should result in high confidence since score will be high
      expect(recommendations[0].confidence).toBeGreaterThan(0.8)
    })

    it('should handle characters with only age trait', async () => {
      mockAgeStrategy.score.and.returnValue(1)
      mockGenderStrategy.score.and.returnValue(0)
      mockRoleStrategy.score.and.returnValue(0)
      
      const recommendations = await service.generateSmartAssignments('Test story')
      
      expect(mockAgeStrategy.score).toHaveBeenCalled()
      expect(recommendations[0].confidence).toBeGreaterThan(0)
    })

    it('should provide alternatives in recommendations', async () => {
      const recommendations = await service.generateSmartAssignments('Test story')
      
      expect(recommendations[0].alternatives).toBeDefined()
      expect(recommendations[0].alternatives!.length).toBeGreaterThan(0)
      expect(recommendations[0].alternatives![0].voiceId).toBeDefined()
      expect(recommendations[0].alternatives![0].reasoning).toBeDefined()
    })

    it('should call all applicable strategies for character scoring', async () => {
      await service.generateSmartAssignments('Test story')
      
      expect(mockAgeStrategy.score).toHaveBeenCalled()
      expect(mockGenderStrategy.score).toHaveBeenCalled()
      expect(mockRoleStrategy.score).toHaveBeenCalled()
    })

    it('should generate comprehensive reasoning from all strategies', async () => {
      const recommendations = await service.generateSmartAssignments('Test story')
      
      expect(mockAgeStrategy.getReasoning).toHaveBeenCalled()
      expect(mockGenderStrategy.getReasoning).toHaveBeenCalled()
      expect(mockRoleStrategy.getReasoning).toHaveBeenCalled()
      expect(recommendations[0].reasoning).toContain('Age reasoning')
      expect(recommendations[0].reasoning).toContain('Gender reasoning')
      expect(recommendations[0].reasoning).toContain('Role reasoning')
    })
  })

  describe('character trait analysis', () => {
    it('should detect elderly characters from name patterns', async () => {
      const elderlyStory: ParsedStory = {
        characters: [{ name: 'Grandma Smith', appearances: 2 }],
        segments: [{ type: 'dialogue', text: 'Hello dear', character: 'Grandma Smith' }]
      }
      mockParser.parseStory.and.returnValue(Promise.resolve(elderlyStory))
      
      await service.generateSmartAssignments('Story with grandma')
      
      expect(mockAgeStrategy.score).toHaveBeenCalledWith(
        jasmine.any(Object),
        jasmine.objectContaining({ age: 'elderly' })
      )
    })

    it('should detect child characters from name patterns', async () => {
      const childStory: ParsedStory = {
        characters: [{ name: 'Little Boy', appearances: 1 }],
        segments: [{ type: 'dialogue', text: 'Can I play?', character: 'Little Boy' }]
      }
      mockParser.parseStory.and.returnValue(Promise.resolve(childStory))
      
      await service.generateSmartAssignments('Story with child')
      
      expect(mockAgeStrategy.score).toHaveBeenCalledWith(
        jasmine.any(Object),
        jasmine.objectContaining({ age: 'child' })
      )
    })

    it('should detect male characters from pronoun patterns', async () => {
      const maleStory: ParsedStory = {
        characters: [{ name: 'King Arthur', appearances: 1 }],
        segments: [{ type: 'dialogue', text: 'I am the king', character: 'King Arthur' }]
      }
      mockParser.parseStory.and.returnValue(Promise.resolve(maleStory))
      
      await service.generateSmartAssignments('Story with king')
      
      expect(mockGenderStrategy.score).toHaveBeenCalledWith(
        jasmine.any(Object),
        jasmine.objectContaining({ gender: 'male' })
      )
    })

    it('should detect protagonist role from name patterns', async () => {
      const heroStory: ParsedStory = {
        characters: [{ name: 'Hero Johnson', appearances: 3 }],
        segments: [{ type: 'dialogue', text: 'I will save everyone!', character: 'Hero Johnson' }]
      }
      mockParser.parseStory.and.returnValue(Promise.resolve(heroStory))
      
      await service.generateSmartAssignments('Hero story')
      
      expect(mockRoleStrategy.score).toHaveBeenCalledWith(
        jasmine.any(Object),
        jasmine.objectContaining({ role: 'protagonist' })
      )
    })

    it('should extract character context for future use', async () => {
      const contextStory: ParsedStory = {
        characters: [{ name: 'TestChar', appearances: 1 }],
        segments: [
          { type: 'narration', text: 'TestChar was brave and kind', character: undefined },
          { type: 'dialogue', text: 'I help people', character: 'TestChar' }
        ]
      }
      mockParser.parseStory.and.returnValue(Promise.resolve(contextStory))
      
      const recommendations = await service.generateSmartAssignments('Context story')
      
      // Context should be extracted and available for future emotion analysis
      expect(recommendations[0].character).toBe('TestChar')
    })
  })

  describe('story analysis for narrator', () => {
    it('should analyze story tone correctly', () => {
      // Access private method through any cast for testing
      const service_any = service as any
      
      const whimsicalAnalysis = service_any.analyzeStoryForNarrator('Once upon a time in a fairy tale land')
      expect(whimsicalAnalysis.tone).toBe('whimsical')
      
      const dramaticAnalysis = service_any.analyzeStoryForNarrator('The dark mysterious adventure began')
      expect(dramaticAnalysis.tone).toBe('dramatic')
      
      const formalAnalysis = service_any.analyzeStoryForNarrator('Dear gentle noble readers')
      expect(formalAnalysis.tone).toBe('formal')
    })

    it('should detect story genres correctly', () => {
      const service_any = service as any
      
      const fantasyAnalysis = service_any.analyzeStoryForNarrator('Magic fairy princess story')
      expect(fantasyAnalysis.genre).toContain('fantasy')
      
      const romanceAnalysis = service_any.analyzeStoryForNarrator('Love and heart and romance')
      expect(romanceAnalysis.genre).toContain('romance')
      
      const adventureAnalysis = service_any.analyzeStoryForNarrator('Epic quest and journey adventure')
      expect(adventureAnalysis.genre).toContain('adventure')
    })

    it('should determine story length correctly', () => {
      const service_any = service as any
      
      const shortStory = 'Short story. ' // < 500 words
      const longStory = 'This is a very long story. '.repeat(300) // > 1500 words (6 words * 300 = 1800 words)
      const mediumStory = 'This is a medium story. '.repeat(100) // 500-1500 words (5 words * 100 = 500 words)
      
      expect(service_any.analyzeStoryForNarrator(shortStory).length).toBe('short')
      expect(service_any.analyzeStoryForNarrator(longStory).length).toBe('long')
      expect(service_any.analyzeStoryForNarrator(mediumStory).length).toBe('medium')
    })
  })

  describe('error handling', () => {
    it('should handle parser errors gracefully', async () => {
      mockParser.parseStory.and.returnValue(Promise.reject(new Error('Parse error')))
      
      await expectAsync(service.generateSmartAssignments('Invalid story'))
        .toBeRejected()
    })

    it('should provide default reasoning when no traits are available', async () => {
      const noTraitsStory: ParsedStory = {
        characters: [{ name: 'UnknownChar', appearances: 1 }],
        segments: [{ type: 'dialogue', text: 'Hello', character: 'UnknownChar' }]
      }
      mockParser.parseStory.and.returnValue(Promise.resolve(noTraitsStory))
      
      // Mock strategies to return no applicable traits
      mockAgeStrategy.getReasoning.and.returnValue('')
      mockGenderStrategy.getReasoning.and.returnValue('')
      mockRoleStrategy.getReasoning.and.returnValue('')
      
      const recommendations = await service.generateSmartAssignments('No traits story')
      
      expect(recommendations[0].reasoning).toContain('suitable for general character roles')
    })

    it('should handle neutral scoring when no traits match', async () => {
      mockAgeStrategy.score.and.returnValue(0)
      mockGenderStrategy.score.and.returnValue(0)
      mockRoleStrategy.score.and.returnValue(0)
      
      const recommendations = await service.generateSmartAssignments('Test story')
      
      // Should still provide a recommendation with neutral confidence
      expect(recommendations[0].confidence).toBeGreaterThanOrEqual(0)
      expect(recommendations[0].recommendedVoiceId).toBeTruthy()
    })
  })
})