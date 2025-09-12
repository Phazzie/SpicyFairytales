import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { VoiceService, ParsedStory, VoiceAssignment, AudioChunk } from '../shared/contracts';

@Injectable()
export class ElevenLabsVoiceService implements VoiceService {
  private readonly baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {}

  synthesize(story: ParsedStory, assignments?: VoiceAssignment[]): Observable<AudioChunk> {
    return from(this.generateAudioForStory(story, assignments));
  }

  private async *generateAudioForStory(story: ParsedStory, assignments?: VoiceAssignment[]): AsyncGenerator<AudioChunk> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    // Create voice assignments if not provided
    const voiceAssignments = assignments || this.createDefaultAssignments(story);

    // Process each dialogue segment
    for (const segment of story.segments) {
      if (segment.type === 'dialogue' && segment.character) {
        const assignment = voiceAssignments.find(a => a.character === segment.character);
        if (assignment) {
          try {
            const audioData = await this.generateAudioSegment(segment.text, assignment.voiceId);
            yield {
              audio: audioData,
              text: segment.text,
              timestamp: Date.now()
            };
          } catch (error) {
            console.error(`Failed to generate audio for segment: ${segment.text}`, error);
            // Continue with next segment
          }
        }
      }
    }
  }

  private async generateAudioSegment(text: string, voiceId: string): Promise<ArrayBuffer> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.arrayBuffer();
  }

  private createDefaultAssignments(story: ParsedStory): VoiceAssignment[] {
    // Use ElevenLabs voice IDs for different characters
    const voiceIds = [
      '21m00Tcm4TlvDq8ikWAM', // Rachel (female)
      'AZnzlk1XvdvUeBnXmlld', // Dom (male)
      'EXAVITQu4vr4xnSDxMaL', // Bella (female)
      'ErXwobaYiN019PkySvjV', // Antoni (male)
      'MF3mGyEYCl7XYWbV9V6O', // Elli (female)
      'TxGEqnHWrfWFTfGW9XjX', // Josh (male)
      'VR6AewLTigWG4xSOukaG', // Arnold (male)
      'pNInz6obpgDQGcFmaJgB', // Adam (male)
      'yoZ06aMxZJJ28mfd3POQ', // Sam (male)
    ];

    return story.characters.map((character, index) => ({
      character: character.name,
      voiceId: voiceIds[index % voiceIds.length]
    }));
  }

  async listVoices(): Promise<{ id: string; name: string }[]> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices?.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name
      })) || [];

    } catch (error) {
      console.error('Failed to list voices:', error);
      return [];
    }
  }

  private getApiKey(): string | null {
    // Try environment variable first
    const envKey = (window as any).VITE_ELEVENLABS_API_KEY || (import.meta as any).env?.VITE_ELEVENLABS_API_KEY;
    if (envKey) return envKey;

    // Fallback to localStorage for development
    return localStorage.getItem('ELEVENLABS_API_KEY');
  }
}