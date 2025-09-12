import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SpeakerParser, ParsedStory, ParsedStorySegment } from '../shared/contracts';

@Injectable()
export class GrokSpeakerParser implements SpeakerParser {
  private readonly model = (import.meta as { env?: { VITE_GROK_MODEL?: string } }).env?.VITE_GROK_MODEL ?? 'grok-4-0709';

  constructor(private http: HttpClient) {}

  async parseStory(text: string): Promise<ParsedStory> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('GROK_API_KEY not configured for speaker parsing');
    }

    try {
      const body = {
        messages: [{
          role: 'user',
          content: this.buildParsePrompt(text)
        }],
        model: this.model,
        temperature: 0.3, // Lower temperature for more consistent parsing
      };
      const data = await firstValueFrom(
        this.http.post<any>('https://api.x.ai/v1/chat/completions', body, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        })
      );
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
      // Prefer fenced code block; fall back to first JSON object
      const fenced = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      const jsonStr = fenced ? fenced[1] : (response.match(/\{[\s\S]*\}/)?.[0] ?? null);
      if (!jsonStr) throw new Error('No JSON found in Grok response');
      const parsed = JSON.parse(jsonStr);

      // Validate the structure
      if (!parsed.segments || !Array.isArray(parsed.segments)) {
        throw new Error('Invalid segments array in response');
      }

      // Validate and clean up segments
      const AllowedSegmentTypes = ['narration', 'dialogue', 'action'] as const;
      type SegmentType = typeof AllowedSegmentTypes[number];

      const validSegments: ParsedStorySegment[] = parsed.segments
        .filter((segment: any): segment is any & { type: SegmentType; text: string } => {
          return typeof segment.type === 'string' &&
                 AllowedSegmentTypes.includes(segment.type as SegmentType) &&
                 typeof segment.text === 'string' &&
                 segment.text.trim().length > 0;
        })
        .map((segment: any & { type: SegmentType; text: string }) => ({
          type: segment.type,
          text: segment.text.trim(),
          character: segment.type === 'dialogue' ? segment.character : undefined,
          emotion: segment.emotion,
          ssml: segment.ssml
        }));

      const rawChars = Array.isArray(parsed.characters) ? parsed.characters : [];

      return {
        segments: validSegments,
        characters: rawChars.length > 0
          ? rawChars.map((char: any) => ({
              name: char.name || 'Unknown',
              appearances: char.appearances || 0
            }))
          : Object.entries(
              validSegments
                .filter((s: ParsedStorySegment) => s.type === 'dialogue' && s.character)
                .reduce<Record<string, number>>((acc: Record<string, number>, s: ParsedStorySegment) => {
                  const key = (s.character ?? 'Unknown').trim();
                  acc[key] = (acc[key] ?? 0) + 1;
                  return acc;
                }, {})
            ).map(([name, appearances]) => ({ name, appearances }))
      };

    } catch (error) {
      throw new Error(`Failed to parse Grok response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getApiKey(): string | null {
    // Dev-only fallback guarded for SSR
    if (isDevMode() && typeof localStorage !== 'undefined') {
      return localStorage.getItem('GROK_API_KEY');
    }
    return null;
  }
}