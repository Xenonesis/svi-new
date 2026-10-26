import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  transcribeCallAudio,
  analyzeCallTranscript,
  separateSpeakerTurns,
  generateCallIntelligence,
} from '@/src/lib/leads/callIntelligence';

describe('Call Intelligence Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GROQ_API_KEY = 'mock_groq_api_key';
  });

  describe('transcribeCallAudio', () => {
    it('sends audio buffer to Groq Whisper and returns transcribed text', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          text: ' Hello sir this is SVI Infra. ',
          duration: 12.5,
        }),
      });
      global.fetch = mockFetch;

      const buffer = Buffer.from('mock audio bytes');
      const result = await transcribeCallAudio(buffer, 'test.wav');

      expect(result.text).toBe('Hello sir this is SVI Infra.');
      expect(result.duration).toBe(12.5);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.groq.com/openai/v1/audio/transcriptions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: 'Bearer mock_groq_api_key',
          },
        })
      );
    });

    it('throws error if Groq Whisper returns HTTP failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Invalid audio format',
      });

      const buffer = Buffer.from('bad audio');
      await expect(transcribeCallAudio(buffer)).rejects.toThrow(
        /Groq Whisper transcription failed \(400\)/
      );
    });
  });

  describe('analyzeCallTranscript', () => {
    it('parses LLM response into structured real estate call intelligence', async () => {
      const mockLlmResponse = {
        summary: 'Customer wants a 100 gaj plot near Ring Road for investment.',
        interest_level: 'Hot',
        sentiment: 'Positive',
        intent: 'Site Visit Requested',
        budget: '25 Lakhs',
        property_interest: '100 gaj plot near Ring Road',
        recommended_action: 'Send location map and schedule Sunday site visit',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(mockLlmResponse),
              },
            },
          ],
        }),
      });

      const result = await analyzeCallTranscript('Sample conversation text');

      expect(result.summary).toBe(mockLlmResponse.summary);
      expect(result.interest_level).toBe('Hot');
      expect(result.sentiment).toBe('Positive');
      expect(result.intent).toBe('Site Visit Requested');
      expect(result.budget).toBe('25 Lakhs');
      expect(result.property_interest).toBe('100 gaj plot near Ring Road');
      expect(result.recommended_action).toBe(mockLlmResponse.recommended_action);
      expect(result.quality_scorecard).toBeDefined();
      expect(result.quality_scorecard?.overall_score).toBeGreaterThan(0);
      expect(result.whatsapp_recap).toContain('SVI Infra');
    });
    it('handles markdown code block wrappers in LLM JSON output', async () => {
      const mockLlmResponse = {
        summary: 'General inquiry about rates.',
        interest_level: 'Warm',
        sentiment: 'Neutral',
        intent: 'Price Enquiry',
        budget: null,
        property_interest: null,
        recommended_action: 'Share rate card on WhatsApp',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: '```json\n' + JSON.stringify(mockLlmResponse) + '\n```',
              },
            },
          ],
        }),
      });

      const result = await analyzeCallTranscript('Rates kya chal rahe hain?');

      expect(result.interest_level).toBe('Warm');
      expect(result.intent).toBe('Price Enquiry');
      expect(result.summary).toBe('General inquiry about rates.');
    });
  });

  describe('separateSpeakerTurns', () => {
    it('separates raw transcript into Telecaller and Customer dialogue turns', async () => {
      const mockTurns = [
        { speaker: 'Telecaller', text: 'Namaste, SVI Infra se baat kar rahi hu.' },
        { speaker: 'Customer', text: 'Haan ji, plot ke baare me puchna tha.' },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(mockTurns) } }],
        }),
      });

      const dialogue = await separateSpeakerTurns({
        transcript: 'Namaste SVI Infra se baat kar rahi hu. Haan ji plot ke baare me puchna tha.',
        agentName: 'Sonia Garg',
      });

      expect(dialogue).toHaveLength(2);
      expect(dialogue[0].speaker).toBe('Telecaller');
      expect(dialogue[0].text).toBe('Namaste, SVI Infra se baat kar rahi hu.');
      expect(dialogue[1].speaker).toBe('Customer');
      expect(dialogue[1].text).toBe('Haan ji, plot ke baare me puchna tha.');
    });
  });
});
