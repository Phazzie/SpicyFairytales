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
          temperature: 0.7,
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
    const themes = options.themes?.join(', ') || 'various themes';
    return `Write a ${options.genre} story with the following specifications:

Title: ${options.title || 'A Dark Tale'}
Themes: ${themes}
Tone: ${options.tone}
Length: ${options.length} story
${options.prompt ? `Additional instructions: ${options.prompt}` : ''}

Please write a complete, engaging story that fits these specifications.`;
  }

  private getApiKey(): string | null {
    // Try environment variable first
    const envKey = (window as any).VITE_GROK_API_KEY || (import.meta as any).env?.VITE_GROK_API_KEY;
    if (envKey) return envKey;

    // Fallback to localStorage for development
    return localStorage.getItem('GROK_API_KEY');
  }
}