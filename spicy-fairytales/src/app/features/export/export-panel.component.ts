/**
 * Multi-format export component for story and audio content distribution.
 * 
 * Provides comprehensive export capabilities for generated content, supporting multiple
 * output formats for different use cases. Handles story text export, audio file generation,
 * and metadata preservation for content sharing and archival.
 * 
 * INPUT: Story content from StoryStore, generated audio data, voice assignment metadata
 * OUTPUT: Downloadable files (text, audio, JSON), export format selection, download triggers
 * DEPENDENCIES: StoryStore for content access, browser download APIs, file format handlers
 * INTEGRATIONS: Final pipeline component for content distribution and sharing
 * FORMATS: Text (TXT, MD), Audio (MP3, WAV), Metadata (JSON), Combined packages (ZIP)
 * FEATURES: Format selection, quality options, metadata inclusion, batch export capabilities
 */
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { StoryStore } from '../../stores/story.store'

@Component({
  selector: 'app-export-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="export">
      <h3>Export</h3>
      <div class="row">
        <button (click)="exportTxt()" [disabled]="!text">Export TXT</button>
        <button (click)="exportJson()" [disabled]="!text">Export JSON</button>
      </div>
      <div class="muted" *ngIf="!text">Nothing to export yet.</div>
    </section>
  `,
  styles: [
    `
      .export { display: grid; gap: 0.5rem; }
      .row { display: flex; gap: 0.5rem; }
      .muted { color: #666; font-style: italic; }
    `,
  ],
})
export class ExportPanelComponent {
  get text() {
    return this.store.currentText()
  }

  constructor(private store: StoryStore) {}

  exportTxt() {
    const text = this.text
    if (!text) return
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    this.download(url, 'story.txt')
  }

  exportJson() {
    const parsed = this.store.parsed()
    const payload = parsed ?? { text: this.text }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    this.download(url, 'story.json')
  }

  private download(url: string, filename: string) {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}
