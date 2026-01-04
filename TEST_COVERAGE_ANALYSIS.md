# Test Coverage Analysis - SafeStep Tactical

## Executive Summary

**Current Test Coverage: 0%**

This codebase has **zero test infrastructure** - no testing framework, no test files, and no test scripts configured. This analysis identifies critical areas that need testing and provides a prioritized roadmap for implementation.

---

## Current State

| Metric | Status |
|--------|--------|
| Test files | 0 |
| Test framework | Not installed |
| Test scripts in package.json | None |
| Lines of code | ~1,250 |
| Components | 5 |
| Services | 2 |

---

## Priority 1: Critical - Pure Utility Functions

These are the easiest to test and provide the highest return on investment.

### 1.1 `services/audioUtils.ts` - Audio Processing

**Functions to test:**
- `decode(base64: string): Uint8Array` (line 11-18)
- `decodeAudioData(data, ctx, sampleRate, numChannels): Promise<AudioBuffer>` (line 25-42)

**Why critical:**
- Core audio functionality - if this breaks, the entire app is non-functional
- Pure functions with predictable inputs/outputs
- Easy to mock AudioContext

**Suggested tests:**
```typescript
// audioUtils.test.ts
describe('decode', () => {
  it('should decode valid base64 string to Uint8Array')
  it('should handle empty string')
  it('should throw on invalid base64')
})

describe('decodeAudioData', () => {
  it('should convert PCM data to AudioBuffer with correct sample rate')
  it('should handle mono audio (1 channel)')
  it('should normalize Int16 values to Float32 range [-1, 1]')
  it('should handle empty data array')
})
```

### 1.2 `services/geminiService.ts` - Segment Calculation

**Function to test:**
- `calculateTotalSegments(durationSeconds: number): number` (line 20-22)

**Why critical:**
- Determines mission pacing - incorrect values break UX
- Pure function, trivial to test

**Suggested tests:**
```typescript
describe('calculateTotalSegments', () => {
  it('should return 1 for durations less than 45 seconds')
  it('should return 2 for 90-second duration')
  it('should ceil fractional segments (e.g., 50s -> 2 segments)')
  it('should handle edge case of exactly 45 seconds')
  it('should handle very long durations')
})
```

---

## Priority 2: High - API Integration Layer

### 2.1 `services/geminiService.ts` - API Functions

**Functions to test with mocked API:**
- `generateTacticalImage(prompt, aspectRatio)` (line 24-45)
- `generateSafetyProtocol(route, totalSegments)` (line 62-85)
- `generateSafetySegment(route, segmentIndex, totalSegmentsEstimate, protocolBeat)` (line 87-104)
- `generateSegmentAudio(text, audioContext, voiceName)` (line 106-126)

**Why important:**
- These are the main integration points with Google Gemini API
- Need to verify correct request formatting
- Need to handle API errors gracefully
- Fallback behavior must be tested (e.g., line 83: fallback array)

**Suggested tests:**
```typescript
describe('generateSafetyProtocol', () => {
  it('should return array of protocol beats on success')
  it('should return fallback array on API failure')
  it('should format prompt with route details correctly')
  it('should parse JSON response correctly')
})

describe('generateTacticalImage', () => {
  it('should return data URL on success')
  it('should return null on API failure')
  it('should append tactical style suffix to prompt')
})

describe('getGuardianInstruction (internal)', () => {
  it('should return correct persona for REASSURING style')
  it('should return correct persona for SCOUT style')
  it('should return correct persona for TACTICAL style')
  it('should return correct persona for LOCAL style')
  it('should return default persona for unknown style')
})
```

---

## Priority 3: Medium - Component Logic

### 3.1 `components/RoutePlanner.tsx` - Route Planning

**Key logic to test:**
- Geocoding flow (line 37-48)
- OSRM routing integration (line 49-66)
- Error handling states (line 33, 44-47, 64-65, 67-68)
- Guardian program selection (line 18-23, 53)

**Why important:**
- User-facing form with multiple failure modes
- External API integrations need mocking
- Error states affect UX

**Suggested tests:**
```typescript
describe('RoutePlanner', () => {
  describe('geocoding', () => {
    it('should show error when start location not found')
    it('should show error when end location not found')
    it('should proceed to routing when both locations found')
  })

  describe('routing', () => {
    it('should call onRouteFound with correct RouteDetails')
    it('should show error when route not found')
    it('should show error on network failure')
  })

  describe('guardian selection', () => {
    it('should default to REASSURING guardian')
    it('should update selected guardian on click')
    it('should include correct voice name in route details')
  })

  describe('validation', () => {
    it('should show error when start is empty')
    it('should show error when destination is empty')
    it('should disable button during loading')
  })
})
```

### 3.2 `components/GuardianConsole.tsx` - Audio Playback

**Key logic to test:**
- Play/pause toggle logic (line 91-102)
- Segment advancement (line 78-84)
- Vitality stats simulation (line 34-51)
- Progress calculation (line 104)

**Why important:**
- Complex audio state management
- Critical user interaction flow
- Timer-based logic needs careful testing

**Suggested tests:**
```typescript
describe('GuardianConsole', () => {
  describe('playback control', () => {
    it('should toggle from pause to play state')
    it('should toggle from play to pause state')
    it('should show buffering state when audio not ready')
  })

  describe('segment progression', () => {
    it('should advance to next segment when audio ends')
    it('should stop playback on last segment')
    it('should call onSegmentChange when segment changes')
  })

  describe('progress indicator', () => {
    it('should calculate correct progress percentage')
    it('should show 0% at start')
    it('should show 100% at end')
  })

  describe('vitality simulation', () => {
    it('should update stats while playing')
    it('should not update stats while paused')
    it('should generate realistic BPM range (85-110)')
  })
})
```

---

## Priority 4: Lower - Integration & E2E

### 4.1 `App.tsx` - Application State Machine

**State transitions to test:**
- ONBOARDING -> PLANNING (line 95-96)
- PLANNING -> INITIALIZING_GUARDIAN (line 61)
- INITIALIZING_GUARDIAN -> READY_TO_WALK (line 81)
- READY_TO_WALK -> ACTIVE (implicit via segment generation)

**Suggested tests:**
```typescript
describe('App', () => {
  describe('state transitions', () => {
    it('should start in ONBOARDING state')
    it('should transition to PLANNING after onboarding complete')
    it('should transition to INITIALIZING after route found')
    it('should transition to READY_TO_WALK after first segment ready')
  })

  describe('segment buffering', () => {
    it('should auto-generate next segment when buffer low')
    it('should not generate if already generating')
    it('should stop generating at total segment count')
  })
})
```

### 4.2 Map Components

**`InlineMap.tsx` and `MapBackground.tsx`:**
- Less critical for unit testing
- Would benefit from visual regression testing
- Leaflet integration could be integration tested

---

## Recommended Testing Setup

### Framework: Vitest

Vitest is recommended because:
- Native ESM support (matches project's `"type": "module"`)
- Works seamlessly with Vite
- Jest-compatible API
- Fast execution

### Installation

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitest/coverage-v8
```

### Configuration

**vite.config.ts additions:**
```typescript
/// <reference types="vitest" />
export default defineConfig({
  // ... existing config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
```

**package.json scripts:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Immediate)
1. Install testing dependencies
2. Configure Vitest
3. Write tests for `audioUtils.ts` (pure functions)
4. Write tests for `calculateTotalSegments` (pure function)

### Phase 2: Service Layer
1. Create API mocks for Google Gemini
2. Test `generateSafetyProtocol` with mocked responses
3. Test `generateSafetySegment` with mocked responses
4. Test error handling and fallbacks

### Phase 3: Component Testing
1. Test `RoutePlanner` form validation and state
2. Test `GuardianConsole` playback logic
3. Test `Onboarding` navigation

### Phase 4: Integration
1. Test `App.tsx` state machine transitions
2. Add E2E tests for critical user flows

---

## Risk Assessment

| Component | Risk if Untested | Complexity to Test |
|-----------|------------------|-------------------|
| audioUtils.ts | High (app unusable) | Low |
| calculateTotalSegments | Medium (UX broken) | Very Low |
| API functions | High (data corruption) | Medium |
| RoutePlanner | High (can't start mission) | Medium |
| GuardianConsole | High (audio broken) | High |
| App state machine | Medium | Medium |
| Map components | Low | High |

---

## Conclusion

The SafeStep Tactical application has **zero test coverage**, creating significant risk for:
- Regressions during development
- Difficult debugging of audio/API issues
- No confidence in deployments

**Recommended first action:** Install Vitest and write tests for `audioUtils.ts` and `calculateTotalSegments`. These provide immediate value with minimal effort.
