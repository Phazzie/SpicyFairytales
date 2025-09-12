import { Injectable } from '@angular/core';
import { SpeakerParser, ParsedStory, ParsedStorySegment } from '../shared/contracts';

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
          temperature: 0.3, // Lower temperature for more consistent parsing
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
    return `Please analyze this story and break it down into segments. Return a JSON object with the following structure:

{
  "segments": [
    {
      "type": "narration|dialogue|action",
      "text": "The exact text from the story",
      "character": "Character name (only for dialogue segments)",
      "emotion": "Emotion or tone (optional)"
    }
  ],
  "characters": [
    {
      "name": "Character Name",
      "appearances": 5
    }
  ]
}

Story to analyze:
${storyText}

Important:
- Break the story into logical segments
- Use "dialogue" for spoken lines, "narration" for descriptive text, "action" for character actions
- Only include "character" field for dialogue segments
- Count how many times each character appears
- Keep the exact text from the story for each segment`;
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
    // Try environment variable first
    const envKey = (window as any).VITE_GROK_API_KEY || (import.meta as any).env?.VITE_GROK_API_KEY;
    if (envKey) return envKey;

    // Fallback to localStorage for development
    return localStorage.getItem('GROK_API_KEY');
  }
}