import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, firstValueFrom } from 'rxjs';
import { VoiceService, ParsedStory, VoiceAssignment, AudioChunk, NarratorVoiceAssignment } from '../shared/contracts';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
}

@Injectable()
export class ElevenLabsVoiceService implements VoiceService {
  private readonly baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(private http: HttpClient) {}

  synthesize(story: ParsedStory, assignments?: VoiceAssignment[], narratorVoice?: NarratorVoiceAssignment): Observable<AudioChunk> {
    return from(this.generateAudioForStory(story, assignments, narratorVoice));
  }

  private async *generateAudioForStory(story: ParsedStory, assignments?: VoiceAssignment[], narratorVoice?: NarratorVoiceAssignment): AsyncGenerator<AudioChunk> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    // Create voice assignments if not provided
    const voiceAssignments = assignments || this.createDefaultAssignments(story);

    // Set default narrator voice if not provided
    const narratorVoiceAssignment = narratorVoice || this.getDefaultNarratorVoice();

    // Process each segment (dialogue and narration)
    for (const segment of story.segments) {
      try {
        let voiceId: string;

        if (segment.type === 'dialogue' && segment.character) {
          // Handle character dialogue
          const assignment = voiceAssignments.find(a => a.character === segment.character);
          if (!assignment) continue;
          voiceId = assignment.voiceId;
        } else if (segment.type === 'narration') {
          // Handle narration with dedicated narrator voice
          voiceId = narratorVoiceAssignment.voiceId;
        } else {
          // Skip action segments or other types
          continue;
        }

        const audioData = await this.generateAudioSegment(segment.text, voiceId);
        yield {
          audio: audioData,
          text: segment.text,
          timestamp: Date.now(),
          character: segment.character
        };
      } catch (error) {
        console.error(`Failed to generate audio for segment: ${segment.text}`, error);
        // Continue with next segment
      }
    }
  }

  private async generateAudioSegment(text: string, voiceId: string): Promise<ArrayBuffer> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    const controller = new AbortController();
    const timeoutMs = 15000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/text-to-speech/${voiceId}`, {
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        }, {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          responseType: 'arraybuffer',
        })
      );

      return response as ArrayBuffer;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private getDefaultNarratorVoice(): NarratorVoiceAssignment {
    // Use a professional, clear voice for narration
    return {
      voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel - clear and professional
      name: 'Rachel (Narrator)'
    };
  }

  private createDefaultAssignments(story: ParsedStory): VoiceAssignment[] {
    // Use ElevenLabs voice IDs for different characters
    const voiceIds = [
      'AZnzlk1XvdvUeBnXmlld', // Dom (male) - skip Rachel since she's narrator
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
      const { voices } = await firstValueFrom(
        this.http.get<{ voices?: ElevenLabsVoice[] }>(`${this.baseUrl}/voices`, {
          headers: {
            'xi-api-key': apiKey,
          },
        })
      );
      if (!Array.isArray(voices)) {
        return [];
      }
      return voices.map((voice) => ({
        id: voice.voice_id,
        name: voice.name
      }));

    } catch (error) {
      console.error('Failed to list voices:', error);
      return [];
    }
  }

  private getApiKey(): string | null {
    // Never ship secrets to the browser. Allow dev-only localStorage; require server proxy in prod.
    if ((import.meta as any).env?.DEV) {
      return localStorage.getItem('ELEVENLABS_API_KEY');
    }
    return null;
  }
}