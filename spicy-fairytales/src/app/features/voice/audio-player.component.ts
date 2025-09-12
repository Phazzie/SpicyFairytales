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
