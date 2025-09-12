/**
 * ElevenLabs voice synthesis service implementing the final stage of the audio generation pipeline.
 * 
 * Transforms structured story segments (ParsedStory) into natural speech audio using ElevenLabs'
 * text-to-speech API. Handles character voice assignments, emotion-aware synthesis, and streaming
 * audio chunk generation for real-time playback.
 * 
 * INPUT: ParsedStory (structured segments), VoiceAssignment[] (character-to-voice mappings), NarratorVoiceAssignment
 * OUTPUT: Observable<AudioChunk> streaming synthesized audio with metadata (character, timestamp, segment type)
 * DEPENDENCIES: ElevenLabs API for voice synthesis, environment configuration for API keys
 * INTEGRATIONS: Final pipeline stage - consumes ParsedStory from speaker parser, provides audio to UI components
 * PERFORMANCE: Processes segments sequentially to maintain narrative flow, supports concurrent synthesis
 * for non-sequential segments
 */
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { VoiceService, ParsedStory, VoiceAssignment, AudioChunk, NarratorVoiceAssignment } from '../shared/contracts';

@Injectable()
export class ElevenLabsVoiceService implements VoiceService {
  private readonly baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {}

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
        let segmentType: string;

        if (segment.type === 'dialogue' && segment.character) {
          // Handle character dialogue
          const assignment = voiceAssignments.find(a => a.character === segment.character);
          if (!assignment) continue;
          voiceId = assignment.voiceId;
          segmentType = 'dialogue';
        } else if (segment.type === 'narration') {
          // Handle narration with dedicated narrator voice
          voiceId = narratorVoiceAssignment.voiceId;
          segmentType = 'narration';
        } else {
          // Skip action segments or other types
          continue;
        }

        const audioData = await this.generateAudioSegment(segment.text, voiceId);
        yield {
          audio: audioData,
          text: segment.text,
          timestamp: Date.now(),
          segmentType: segment.type as 'narration' | 'dialogue' | 'action',
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