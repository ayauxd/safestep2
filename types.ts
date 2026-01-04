
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type GuardianStyle = 'REASSURING' | 'SCOUT' | 'TACTICAL' | 'LOCAL';

export interface VitalityStats {
  bpm: number;
  steps: number;
  pace: string;
  safetyScore: number;
}

export interface RouteDetails {
  startAddress: string;
  endAddress: string;
  distance: string;
  duration: string;
  durationSeconds: number;
  travelMode: string;
  voiceName: string;
  guardianStyle: GuardianStyle;
}

export interface GuardianSegment {
    index: number;
    text: string;
    audioBuffer: AudioBuffer | null;
}

export interface SafetyAccompaniment {
  totalSegmentsEstimate: number;
  protocol: string[];
  segments: GuardianSegment[];
}

export enum AppState {
  ONBOARDING,
  PLANNING,
  CALCULATING_ROUTE,
  ROUTE_CONFIRMED,
  INITIALIZING_GUARDIAN,
  READY_TO_WALK,
  ACTIVE
}
