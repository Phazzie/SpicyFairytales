/**
 * HTTP-based story generation service implementing the StoryService contract using Grok AI API.
 * 
 * This service is the first stage in the story generation pipeline, converting user preferences
 * (StoryOptions) into streaming narrative text. Uses Server-Sent Events for real-time story
 * generation with the x.ai Grok API endpoint.
 * 
 * INPUT: StoryOptions (genre, tone, length, themes, character type, spicy level)
 * OUTPUT: Observable<string> streaming story chunks as they're generated
 * DEPENDENCIES: Angular HttpClient for API communication, RxJS for reactive streams
 * INTEGRATIONS: Consumed by story generation hooks, feeds into GrokSpeakerParser for dialogue extraction
 * ERROR HANDLING: Throws descriptive errors for API failures, missing API keys, and network issues
 */
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { StoryService, StoryOptions } from '../shared/contracts';

@Injectable()
export class HttpStoryService implements StoryService {
  constructor() {}

  generateStory(options: StoryOptions): Observable<string> {
    return from(this.streamStoryFromGrok(options));
  }

  private async *streamStoryFromGrok(options: StoryOptions): AsyncGenerator<string> {
    const prompt = this.buildPrompt(options);

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'grok-4-0709',
          stream: true,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  yield content;
                }
              } catch (e) {
                // Skip malformed JSON
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      throw new Error(`Story generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildPrompt(options: StoryOptions): string {
    const wordCount = this.getWordCountForLength(options.length);
    const characterType = options.characterType || 'werewolf';
    const spicyLevel = options.spicyLevel || 5;
    const selectedThemes = options.selectedThemes || [];
    const userIdeas = options.userIdeas || '';
    const timePeriod = options.timePeriod || 'modern';
    const magicSystem = options.magicSystem || 5;

    // Base prompt structure
    let prompt = `Write a complete ${wordCount} word story featuring a ${this.getCharacterTypeDescription(characterType)} as the main character.

STORY REQUIREMENTS:
- Word count: ${wordCount} words (be precise)
- Character type: ${this.getCharacterTypeDescription(characterType)}
- Time period: ${this.getTimePeriodDescription(timePeriod)}
- Magic system: ${this.getMagicSystemDescription(magicSystem)}
- Maturity level: ${this.getSpicyLevelDescription(spicyLevel)}
- Themes to incorporate: ${this.getThemesDescription(selectedThemes)}

${userIdeas ? `USER IDEAS TO INCORPORATE:\n${userIdeas}\n\n` : ''}`;

    // Add character-specific guidance
    prompt += this.getCharacterSpecificGuidance(characterType, spicyLevel);

    // Add time period specific guidance
    prompt += this.getTimePeriodGuidance(timePeriod, magicSystem);

    // Add magic system guidance
    prompt += this.getMagicSystemGuidance(magicSystem, timePeriod);

    // Add theme integration guidance
    if (selectedThemes.length > 0) {
      prompt += this.getThemeIntegrationGuidance(selectedThemes, spicyLevel);
    }

    // Add spicy level guidance
    prompt += this.getSpicyLevelGuidance(spicyLevel);

    // Add story structure guidance
    prompt += `

STORY STRUCTURE:
- Introduction: Set the scene in the ${timePeriod} ${this.getMagicSystemLevel(magicSystem)} and introduce the ${characterType}
- Rising Action: Build tension with the selected themes and time period elements
- Climax: Peak emotional/intimate moment fitting the era and magic level
- Resolution: Satisfying conclusion consistent with the world-building

Ensure the story flows naturally, maintains consistent characterization for the ${timePeriod} period, respects the magic system level, and delivers the requested level of spice and maturity. Write in an engaging, narrative style that draws readers in completely.`;

    return prompt;
  }

  private getWordCountForLength(length: string): string {
    switch (length) {
      case 'short': return '700-900';
      case 'medium': return '900-1100';
      case 'long': return '1100-1200';
      default: return '900-1100';
    }
  }

  private getCharacterTypeDescription(type: string): string {
    const descriptions = {
      werewolf: 'werewolf with primal instincts, lunar transformations, and complex pack dynamics',
      vampire: 'vampire with immortal allure, bloodlust, and eternal night sensibilities',
      faerie: 'faerie with magical mischief, ancient secrets, and otherworldly charm'
    };
    return descriptions[type as keyof typeof descriptions] || descriptions.werewolf;
  }

  private getSpicyLevelDescription(level: number): string {
    if (level <= 3) return 'mature themes with subtle romantic tension';
    if (level <= 5) return 'mature content with tasteful sensuality';
    if (level <= 7) return 'explicit romantic content with passion';
    if (level <= 9) return 'highly erotic content with intense passion';
    return 'maximum spice with extreme erotic intensity';
  }

  private getThemesDescription(themes: string[]): string {
    if (themes.length === 0) return 'romance, intrigue, and supernatural elements';

    const themeDescriptions: { [key: string]: string } = {
      romance: 'romantic relationships and emotional connections',
      intrigue: 'mystery, secrets, and suspenseful elements',
      power: 'power dynamics and authority struggles',
      forbidden: 'taboo desires and forbidden attractions',
      transformation: 'personal change and metamorphosis',
      revenge: 'justice, retribution, and payback',
      seduction: 'temptation, allure, and persuasion',
      'dark-desire': 'hidden cravings and forbidden lust',
      betrayal: 'deception, broken trust, and consequences',
      immortality: 'eternal life and timeless themes',
      supernatural: 'ghosts, spirits, and otherworldly forces',
      magic: 'spells, enchantments, and mystical elements',
      hunt: 'pursuit, chase, and primal instincts',
      curse: 'hexes, maledictions, and fateful consequences',
      alliance: 'partnerships, pacts, and complex relationships'
    };

    return themes.map(theme => themeDescriptions[theme] || theme).join(', ');
  }

  private getTimePeriodDescription(period: string): string {
    const descriptions = {
      ancient: 'ancient times with gods, legends, and primordial magic',
      medieval: 'medieval era with knights, castles, and feudal society',
      renaissance: 'renaissance period with art, politics, and emerging science',
      victorian: 'Victorian era with gothic sensibilities and industrial advancement',
      modern: 'contemporary modern world with technology and urban settings',
      futuristic: 'futuristic setting with advanced technology and sci-fi elements'
    };
    return descriptions[period as keyof typeof descriptions] || descriptions.modern;
  }

  private getMagicSystemDescription(level: number): string {
    if (level <= 2) return 'mundane world with little to no magic';
    if (level <= 4) return 'low-magic setting with subtle supernatural elements';
    if (level <= 6) return 'balanced magic system where supernatural coexists with reality';
    if (level <= 8) return 'high-magic world where magic shapes society and daily life';
    return 'pure magic realm where arcane forces dominate everything';
  }

  private getMagicSystemLevel(level: number): string {
    if (level <= 2) return 'realistic world';
    if (level <= 4) return 'low-magic world';
    if (level <= 6) return 'balanced magical world';
    if (level <= 8) return 'high-magic realm';
    return 'pure sorcery domain';
  }

  private getTimePeriodGuidance(timePeriod: string, magicLevel: number): string {
    const baseGuidance = '\n\nTIME PERIOD & SETTING:';

    switch (timePeriod) {
      case 'ancient':
        return `${baseGuidance}
- Incorporate mythological elements and ancient deities
- Include primitive societies, tribal customs, and ancient rituals
- Show the raw, untamed nature of the world and its magic
- Use architecture and technology appropriate to ancient civilizations`;

      case 'medieval':
        return `${baseGuidance}
- Include feudal society, knights, nobles, and peasants
- Incorporate medieval customs, honor codes, and social hierarchies
- Show castle life, medieval warfare, and chivalric romance
- Use period-appropriate language and social structures`;

      case 'renaissance':
        return `${baseGuidance}
- Include artistic patronage, political intrigue, and scientific discovery
- Incorporate renaissance courts, merchant families, and cultural flowering
- Show the tension between tradition and innovation
- Use elegant language befitting the period's sophistication`;

      case 'victorian':
        return `${baseGuidance}
- Include gothic atmosphere, industrial advancement, and social propriety
- Incorporate Victorian morality, hidden desires, and dark secrets
- Show the contrast between public respectability and private passion
- Use formal language with underlying sensuality`;

      case 'modern':
        return `${baseGuidance}
- Include contemporary technology, urban settings, and modern social dynamics
- Incorporate current social issues and lifestyle elements
- Show how supernatural elements interact with modern life
- Use contemporary language and cultural references`;

      case 'futuristic':
        return `${baseGuidance}
- Include advanced technology, space travel, or cyberpunk elements
- Incorporate futuristic society structures and technological integration
- Show how magic and technology might coexist or conflict
- Use evolved language appropriate to the future setting`;

      default:
        return `${baseGuidance}
- Develop the setting appropriate to the time period
- Include period-specific customs, technology, and social structures`;
    }
  }

  private getMagicSystemGuidance(magicLevel: number, timePeriod: string): string {
    const guidance = '\n\nMAGIC SYSTEM INTEGRATION:';

    if (magicLevel <= 2) {
      return `${guidance}
- Keep magic minimal or completely absent
- Focus on realistic human emotions and relationships
- Any supernatural elements should be subtle or ambiguous
- Ground the story in realistic ${timePeriod} period details`;
    }

    if (magicLevel <= 4) {
      return `${guidance}
- Include subtle magical elements that most people don't notice
- Magic should be rare, hidden, or just emerging
- Characters may question whether magic is real
- Blend supernatural elements carefully with ${timePeriod} realism`;
    }

    if (magicLevel <= 6) {
      return `${guidance}
- Magic is known and accepted but not overwhelming
- Include magical creatures, spells, and supernatural abilities
- Balance magical solutions with human ingenuity
- Show how magic fits into ${timePeriod} society`;
    }

    if (magicLevel <= 8) {
      return `${guidance}
- Magic is powerful and shapes daily life and society
- Include complex magical systems, powerful spells, and magical creatures
- Magic influences politics, economics, and social structures
- Show advanced magical integration with ${timePeriod} elements`;
    }

    return `${guidance}
- Magic dominates everything in this world
- Reality bends to magical will, laws of physics are suggestions
- Include reality-altering spells, god-like magical beings
- Magic completely transforms what ${timePeriod} means in this reality`;
  }

  private getCharacterSpecificGuidance(characterType: string, spicyLevel: number): string {
    const baseGuidance = '\n\nCHARACTER DEVELOPMENT:';

    switch (characterType) {
      case 'werewolf':
        return `${baseGuidance}
- Explore the duality of human and beast nature
- Include lunar cycles and their influence on behavior and desires
- Develop pack dynamics and territorial instincts
- Show the raw, primal aspects of ${spicyLevel > 5 ? 'passion and intimacy' : 'emotion and connection'}`;

      case 'vampire':
        return `${baseGuidance}
- Emphasize immortal perspective and eternal consequences
- Include bloodlust and its parallels to intense desire
- Develop aristocratic charm mixed with predatory instincts
- Show the seductive power of ${spicyLevel > 5 ? 'immortal passion' : 'timeless allure'}`;

      case 'faerie':
        return `${baseGuidance}
- Incorporate magical mischief and ancient wisdom
- Include otherworldly charm and supernatural allure
- Develop complex motivations beyond mortal understanding
- Show the enchanting nature of ${spicyLevel > 5 ? 'magical intimacy' : 'otherworldly connection'}`;

      default:
        return `${baseGuidance}
- Develop complex character motivations and desires
- Show internal conflicts and external challenges
- Build emotional depth and character growth`;
    }
  }

  private getThemeIntegrationGuidance(themes: string[], spicyLevel: number): string {
    let guidance = '\n\nTHEME INTEGRATION:';

    // Group themes by intensity level
    const intenseThemes = themes.filter(t => ['forbidden', 'dark-desire', 'betrayal', 'revenge'].includes(t));
    const romanticThemes = themes.filter(t => ['romance', 'seduction', 'alliance'].includes(t));
    const supernaturalThemes = themes.filter(t => ['supernatural', 'magic', 'immortality', 'curse'].includes(t));

    if (intenseThemes.length > 0) {
      guidance += `\n- Weave ${intenseThemes.join(' and ')} into the narrative tension`;
    }

    if (romanticThemes.length > 0) {
      guidance += `\n- Develop ${romanticThemes.join(' and ')} as central relationship dynamics`;
    }

    if (supernaturalThemes.length > 0) {
      guidance += `\n- Integrate ${supernaturalThemes.join(' and ')} as core supernatural elements`;
    }

    if (spicyLevel > 6) {
      guidance += '\n- Use selected themes to heighten emotional and physical intensity';
    }

    return guidance;
  }

  private getSpicyLevelGuidance(level: number): string {
    const guidance = '\n\nMATURITY & SPICE LEVEL:';

    if (level <= 3) {
      return `${guidance}
- Focus on emotional intimacy and romantic tension
- Use subtle sensual descriptions and emotional connection
- Maintain tasteful, mature themes without explicit content
- Emphasize psychological and emotional aspects of relationships`;
    }

    if (level <= 5) {
      return `${guidance}
- Include tasteful sensual content and romantic encounters
- Balance emotional depth with physical attraction
- Use descriptive language that enhances mood and atmosphere
- Focus on mutual desire and emotional fulfillment`;
    }

    if (level <= 7) {
      return `${guidance}
- Incorporate explicit romantic content and passionate encounters
- Describe physical intimacy with sensual detail
- Balance erotic elements with emotional connection
- Use vivid, evocative language for intimate scenes`;
    }

    if (level <= 9) {
      return `${guidance}
- Include highly erotic content with intense passion
- Describe physical encounters with explicit detail
- Combine emotional depth with raw physical desire
- Use sophisticated, evocative language for maximum impact`;
    }

    return `${guidance}
- Deliver maximum spice with extreme erotic intensity
- Include explicit, uninhibited romantic content
- Combine raw passion with deep emotional connection
- Use vivid, unrestrained language for ultimate impact
- Push boundaries while maintaining narrative coherence`;
  }

}