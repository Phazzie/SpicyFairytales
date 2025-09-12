/**
 * Lightweight audio player component for voice sample preview and testing.
 * 
 * Specialized audio player for previewing individual voice samples during voice selection
 * and assignment processes. Provides simple audio controls for testing voice quality and
 * character fit before final assignment.
 * 
 * INPUT: src (audio URL or blob URL), audio sample data
 * OUTPUT: Audio playback controls, sample preview functionality
 * DEPENDENCIES: CommonModule for template directives, HTML5 audio element
 * INTEGRATIONS: Used within voice selection components, voice management interfaces
 * FEATURES: Simple play controls, sample audio handling, empty state display
 * PURPOSE: Voice quality assessment, character voice matching, user preview before synthesis
 */
import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="player">
      <audio *ngIf="src" [src]="src!" controls></audio>
      <div *ngIf="!src" class="muted">No audio yet. Generate to preview.</div>
    </section>
  `,
  styles: [
    `
      .muted { color: #666; font-style: italic; }
      .player { display: block; }
      audio { width: 100%; }
    `,
  ],
})
export class AudioPlayerComponent {
  @Input() src: string | null = null
}
