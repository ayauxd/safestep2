
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Modality, Type } from "@google/genai";
import { RouteDetails, GuardianSegment, GuardianStyle } from "../types";
import { decode, decodeAudioData } from "./audioUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TARGET_SEGMENT_DURATION_SEC = 45; 
const WORDS_PER_MINUTE = 140;
const WORDS_PER_SEGMENT = Math.round((TARGET_SEGMENT_DURATION_SEC / 60) * WORDS_PER_MINUTE);

// Strictly defined for Commercial Elite Fitness Aesthetic (Nike/Strava style)
const TACTICAL_STYLE_SUFFIX = " Professional fitness campaign photography, Nike Run Club style, elite athlete portrait, dramatic cinematic urban lighting, high contrast, technical performance sportswear, realistic skin textures, deep blacks, subtle digital HUD overlays, 8k resolution, raw and authentic energy, motivational lighting.";

export const calculateTotalSegments = (durationSeconds: number): number => {
    return Math.max(1, Math.ceil(durationSeconds / TARGET_SEGMENT_DURATION_SEC));
};

export const generateTacticalImage = async (prompt: string, aspectRatio: "1:1" | "9:16" = "9:16"): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt + TACTICAL_STYLE_SUFFIX }]
            },
            config: {
                imageConfig: { aspectRatio }
            }
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    } catch (e) {
        console.error("Image generation failed", e);
    }
    return null;
};

const getGuardianInstruction = (style: GuardianStyle): string => {
    switch (style) {
        case 'REASSURING':
            return "Persona: A calm, elite performance coach. Focus: Breath control, rhythmic pacing, and mindful movement.";
        case 'SCOUT':
            return "Persona: A high-intensity urban scout. Focus: Rapid pathfinding, visual milestones, and high-performance navigation.";
        case 'TACTICAL':
            return "Persona: A professional security overwatch. Focus: Situational awareness, perimeter integrity, and assertive urban movement.";
        case 'LOCAL':
            return "Persona: A high-energy local runner. Focus: Area-specific context, street-wise shortcuts, and fitness motivation.";
        default:
            return "Persona: A professional urban fitness guardian.";
    }
};

export const generateSafetyProtocol = async (
    route: RouteDetails,
    totalSegments: number
): Promise<string[]> => {
    const prompt = `Task: Build a ${totalSegments}-step high-performance safety protocol for an urban movement from ${route.startAddress} to ${route.endAddress}. Guardian Profile: ${route.guardianStyle}. Output ONLY a raw JSON array of ${totalSegments} strings representing the 'mission-beat' for each segment.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { 
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                thinkingConfig: { thinkingBudget: 2048 }
            }
        });
        const text = response.text?.trim() || "[]";
        return JSON.parse(text);
    } catch (e) {
        return Array(totalSegments).fill("Maintain optimal pace and 360-degree awareness.");
    }
};

export const generateSafetySegment = async (
    route: RouteDetails,
    segmentIndex: number,
    totalSegmentsEstimate: number,
    protocolBeat: string
): Promise<GuardianSegment> => {
    const instruction = getGuardianInstruction(route.guardianStyle);
    const prompt = `System: SafeStep Elite Guidance. Context: Phase ${segmentIndex}/${totalSegmentsEstimate}. Mission: ${protocolBeat}. ${instruction} Word count: ${WORDS_PER_SEGMENT}. Tone: High-performance, professional athlete coach.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
    });
    return {
        index: segmentIndex,
        text: response.text?.trim() || "Protocol active. Stay focused.",
        audioBuffer: null
    };
};

export const generateSegmentAudio = async (text: string, audioContext: AudioContext, voiceName: string): Promise<AudioBuffer> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName } }
            }
        }
    });
    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!data) throw new Error("Audio link failure");
    
    return await decodeAudioData(
        decode(data),
        audioContext,
        24000,
        1
    );
};
