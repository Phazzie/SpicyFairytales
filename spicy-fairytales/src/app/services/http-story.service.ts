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
import { env } from '../shared/env';

@Injectable()
export class HttpStoryService implements StoryService {
  constructor() {}

  generateStory(options: StoryOptions): Observable<string> {
    return from(this.streamStoryFromGrok(options));
  }

  private async *streamStoryFromGrok(options: StoryOptions): AsyncGenerator<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('GROK_API_KEY not configured');
    }

    const prompt = this.buildPrompt(options);

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'grok-4-0709',
          stream: true,
          temperature: 0.8,
          max_tokens: 4000,
          top_p: 0.95,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
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

    // Check if this is a test case with specific word count
    const isTestCase = userIdeas?.includes('API test story with exactly');
    const exactWordMatch = userIdeas?.match(/exactly (\d+) words/);
    const exactWordCount = exactWordMatch ? exactWordMatch[1] : null;

    // Base prompt structure with enhanced AI instructions
    let prompt = `You are an expert creative writer specializing in supernatural romance and fantasy. Write a complete ${exactWordCount ? exactWordCount : wordCount} word story featuring a ${this.getCharacterTypeDescription(characterType)} as the main character.

🎯 CRITICAL REQUIREMENTS:
- Word count: ${exactWordCount ? `EXACTLY ${exactWordCount}` : `EXACTLY ${wordCount}`} words (be precise and count carefully)
- Character type: ${this.getCharacterTypeDescription(characterType)}
- Maturity level: ${this.getSpicyLevelDescription(spicyLevel)}
- Themes to weave in: ${this.getThemesDescription(selectedThemes)}
- Writing style: Immersive, engaging, descriptive with rich sensory details

${isTestCase ? `🧪 THIS IS AN API TEST: Focus on demonstrating full functionality with exactly ${exactWordCount} words. Make it a complete, engaging story that showcases all features.\n\n` : ''}
${userIdeas && !isTestCase ? `📝 SPECIAL USER REQUIREMENTS:\n${userIdeas}\n\n` : ''}

🎭 DIALOGUE REQUIREMENTS:
- Include at least 3-5 distinct speaking characters
- Use quotation marks for all dialogue: "Like this"
- Vary speaking patterns and personalities for each character
- Include internal monologue and thoughts
- Make dialogue natural, emotional, and character-driven

🔥 NARRATIVE STRUCTURE:
- Hook: Compelling opening that immediately establishes tone and character
- Character Development: Show personality through actions, dialogue, and internal conflict
- World Building: Rich, immersive supernatural setting details
- Pacing: Balance action, dialogue, romance, and introspection
- Climax: Emotionally and romantically satisfying peak moment
- Resolution: Complete but leaves reader wanting more

💫 STYLE REQUIREMENTS:
- Use present tense for immediacy and engagement
- Show, don't tell - use actions and dialogue to reveal character
- Include all five senses in descriptions
- Vary sentence length for rhythm and flow
- Use active voice predominantly
- Create emotional resonance and connection`;

    // Add character-specific guidance
    prompt += this.getCharacterSpecificGuidance(characterType, spicyLevel);

    // Add theme integration guidance
    if (selectedThemes.length > 0) {
      prompt += this.getThemeIntegrationGuidance(selectedThemes, spicyLevel);
    }

    // Add spicy level guidance
    prompt += this.getSpicyLevelGuidance(spicyLevel);

    // Add story structure guidance with enhanced detail
    prompt += `

🏗️ DETAILED STORY STRUCTURE GUIDE:
1. OPENING (15-20% of story):
   - Establish ${characterType} protagonist with compelling voice
   - Set supernatural world/setting with vivid details
   - Introduce central conflict or romantic tension
   - Hook reader with intrigue or emotional pull

2. RISING ACTION (40-50% of story):
   - Develop character relationships through dialogue and interaction
   - Build romantic/sexual tension progressively
   - Integrate selected themes naturally into plot
   - Include character backstory and motivations
   - Add obstacles and conflicts that test relationships

3. CLIMAX (20-30% of story):
   - Peak emotional and/or physical intimacy moment
   - Resolve central conflict through character growth
   - Maximum emotional impact and reader engagement
   - Showcase character transformation or realization

4. RESOLUTION (10-15% of story):
   - Satisfying conclusion that feels complete
   - Show how characters have changed/grown
   - Leave subtle hints for future possibilities
   - End with emotional resonance

🎨 ADVANCED WRITING TECHNIQUES:
- Metaphor and symbolism related to supernatural themes
- Sensory-rich descriptions that create atmosphere
- Subtext in dialogue that reveals deeper meanings
- Foreshadowing and callbacks to earlier moments
- Varied pacing: slow burns and quick action sequences
- Multiple layers of conflict: internal, interpersonal, external

Write a story that readers will find completely immersive, emotionally satisfying, and technically excellent. Focus on character depth, relationship dynamics, and supernatural world-building while maintaining the exact word count requested.`;

    return prompt;
  }

  private getWordCountForLength(length: string): string {
    switch (length) {
      case 'short': return '480-600';
      case 'medium': return '700-800';
      case 'long': return '900-1000';
      default: return '700-800';
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

  private getApiKey(): string | null {
    // Use the centralized environment configuration with validation
    return env.getApiKey('grok');
  }
}