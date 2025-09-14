/**
 * AI-powered speaker parsing service that transforms raw story text into structured dialogue segments.
 * 
 * Critical pipeline component that bridges story generation and voice synthesis by extracting
 * character dialogue, narration, and action sequences from unstructured text. Uses Grok AI to
 * intelligently identify speakers and categorize story segments for voice assignment.
 * 
 * INPUT: Raw story text (string) from StoryService
 * OUTPUT: ParsedStory with structured segments (narration/dialogue/action) and character metadata
 * DEPENDENCIES: Grok API for AI-powered text analysis, environment configuration for API keys
 * INTEGRATIONS: Receives text from HttpStoryService, outputs structured data to VoiceAssignmentService
 * CRITICAL: The parser-synthesizer contract is the most fragile integration point - changes to
 * ParsedStory structure will break voice synthesis pipeline
 */
import { Injectable } from '@angular/core';
import { SpeakerParser, ParsedStory, ParsedStorySegment } from '../shared/contracts';
import { env } from '../shared/env';

@Injectable()
export class GrokSpeakerParser implements SpeakerParser {
  constructor() {}

  async parseStory(text: string): Promise<ParsedStory> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('GROK_API_KEY not configured for speaker parsing');
    }

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: this.buildParsePrompt(text)
          }],
          model: 'grok-4-0709',
          temperature: 0.2, // Lower temperature for more consistent parsing
          max_tokens: 3000,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from Grok API');
      }

      return this.parseGrokResponse(content, text);

    } catch (error) {
      throw new Error(`Speaker parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildParsePrompt(storyText: string): string {
    return `You are an expert literary analyst specializing in dialogue extraction and character identification. Analyze this story and break it down into segments for voice synthesis.

🎯 CRITICAL PARSING REQUIREMENTS:
Return a perfectly formatted JSON object with this EXACT structure:

{
  "segments": [
    {
      "type": "narration|dialogue|action",
      "text": "Exact text from the story",
      "character": "Character name (ONLY for dialogue segments)",
      "emotion": "Emotional tone (optional but recommended)"
    }
  ],
  "characters": [
    {
      "name": "Character Name",
      "appearances": 5,
      "description": "Brief character description"
    }
  ]
}

📋 DETAILED SEGMENT CLASSIFICATION RULES:
1. **"dialogue"** - Any spoken words in quotation marks:
   - Include the quotation marks in the text
   - MUST include "character" field with speaker's name
   - Add "emotion" field: happy, sad, angry, seductive, mysterious, etc.

2. **"narration"** - Descriptive text, scene setting, exposition:
   - Background information, setting descriptions
   - Character descriptions from narrator's perspective
   - Transitional text between scenes
   - NO "character" field (leave undefined/null)

3. **"action"** - Character actions, movements, gestures:
   - Physical actions: "He walked across the room"
   - Internal actions: "She felt her heart racing"
   - Action descriptions that advance the plot
   - NO "character" field (leave undefined/null)

🎭 CHARACTER IDENTIFICATION RULES:
- Count every instance where a character speaks (dialogue segments only)
- If a character is unnamed, use descriptive names like "The Stranger", "Woman", "Guard"
- Include brief description of each character's role or appearance
- Be consistent with character naming throughout

📚 PARSING BEST PRACTICES:
- Preserve exact punctuation and formatting from original
- Break long paragraphs into logical segments
- Keep related sentences together in the same segment
- Ensure every word from the original story is included
- Maintain story flow and readability

Story to analyze:
${storyText}

Return ONLY the JSON object, no additional text or explanations.`;
  }

  private parseGrokResponse(response: string, originalStory: string): ParsedStory {
    try {
      // Extract JSON from the response (Grok might add extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Grok response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate the structure
      if (!parsed.segments || !Array.isArray(parsed.segments)) {
        throw new Error('Invalid segments array in response');
      }

      if (!parsed.characters || !Array.isArray(parsed.characters)) {
        throw new Error('Invalid characters array in response');
      }

      // Validate and clean up segments
      const validSegments: ParsedStorySegment[] = parsed.segments
        .filter((segment: any) => {
          return segment.type && segment.text &&
                 ['narration', 'dialogue', 'action'].includes(segment.type);
        })
        .map((segment: any) => ({
          type: segment.type,
          text: segment.text,
          character: segment.character,
          emotion: segment.emotion,
          ssml: segment.ssml
        }));

      return {
        segments: validSegments,
        characters: parsed.characters.map((char: any) => ({
          name: char.name || 'Unknown',
          appearances: char.appearances || 0
        }))
      };

    } catch (error) {
      throw new Error(`Failed to parse Grok response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getApiKey(): string | null {
    // Use the centralized environment configuration with validation
    return env.getApiKey('grok');
  }
}