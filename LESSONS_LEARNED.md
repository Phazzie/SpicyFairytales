# Lessons Learned

A running log of insights, decisions, and retro items. Keep entries short and actionable. Add new sections per milestone.

## 2025-09-11 — Angular Alignment Pass
- React/Vite assumptions in docs caused confusion once Angular workspace landed; centralize tech choices early and keep docs in sync.
- Define DI tokens for major seams (story, parser, voice) up front; simplifies swapping mocks/real services.
- Prefer Observables for UI-bound streaming; wrap AsyncGenerators when needed to fit Angular patterns.
- Store "contracts" in one place and make all services depend on them; catches drift with `ng test` type checks.
- Use env flag `USE_MOCKS` to avoid API costs during development.

### Addendum: First scaffold & compile
- Keep streaming interfaces uniform (Observable at seam) to simplify component binding.
- Fetch + ReadableStream is likely needed for real-time story streaming; HttpClient for non-stream APIs.
- Provide tokens at app root so pages/components remain dumb and testable.

## How to Contribute to This Doc
- Add a dated section with 3–7 concise bullets.
- Link to PRs or commits when relevant.
- Prefer specific “change we’ll make next time” over vague observations.
