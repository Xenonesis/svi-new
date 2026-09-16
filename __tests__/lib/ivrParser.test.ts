import { describe, it, expect } from 'vitest';
import {
  cleanPhoneNumber,
  calculateLeadTemperature,
  parseIvrCsvText,
  resolveAdvisorId,
  type AdvisorProfile,
  type ParsedIvrRecord,
} from '@/src/lib/leads/ivrParser';

describe('ivrParser utilities', () => {
  describe('cleanPhoneNumber', () => {
    it('normalizes 10-digit Indian numbers', () => {
      expect(cleanPhoneNumber('8744875331')).toBe('8744875331');
      expect(cleanPhoneNumber('+918744875331')).toBe('8744875331');
      expect(cleanPhoneNumber('08744875331')).toBe('8744875331');
      expect(cleanPhoneNumber('91-87448-75331')).toBe('8744875331');
    });

    it('returns cleaned raw digits if length is different', () => {
      expect(cleanPhoneNumber('98765')).toBe('98765');
    });
  });

  describe('calculateLeadTemperature', () => {
    it('marks duration >= 60 as hot', () => {
      expect(calculateLeadTemperature(60, null)).toBe('hot');
      expect(calculateLeadTemperature(103, 'NOANSWER')).toBe('hot');
    });

    it('marks pressed key 1 as hot regardless of duration', () => {
      expect(calculateLeadTemperature(10, '1')).toBe('hot');
      expect(calculateLeadTemperature(4, '1')).toBe('hot');
    });

    it('marks duration between 20 and 59 without key 1 as warm', () => {
      expect(calculateLeadTemperature(20, null)).toBe('warm');
      expect(calculateLeadTemperature(45, '2')).toBe('warm');
      expect(calculateLeadTemperature(59, '3')).toBe('warm');
    });

    it('marks duration under 20 as cold', () => {
      expect(calculateLeadTemperature(19, null)).toBe('cold');
      expect(calculateLeadTemperature(0, null)).toBe('cold');
      expect(calculateLeadTemperature(5, '2')).toBe('cold');
    });
  });

  describe('resolveAdvisorId', () => {
    const mockProfiles: AdvisorProfile[] = [
      { id: 'uuid-shivam', full_name: 'Shivam yadav', phone: '9218300593' },
      { id: 'uuid-shikha', full_name: 'Shikha Tomar', phone: '9675792683' },
      { id: 'uuid-khushi', full_name: 'KHUSHI PAl', phone: '9218300589' },
      { id: 'uuid-manish', full_name: 'Manish Sharma', phone: '9217085407' },
    ];

    it('resolves by exact or fuzzy name match', () => {
      expect(resolveAdvisorId('Shivam Yadav', '9311290543', mockProfiles)).toBe('uuid-shivam');
      expect(resolveAdvisorId('Shikha Tomar', '9870345702', mockProfiles)).toBe('uuid-shikha');
      expect(resolveAdvisorId('Khushi Pal', '9315964031', mockProfiles)).toBe('uuid-khushi');
      expect(resolveAdvisorId('Manish', '9217085407', mockProfiles)).toBe('uuid-manish');
    });

    it('resolves by phone match if name varies', () => {
      expect(resolveAdvisorId('Unknown Agent', '9217085407', mockProfiles)).toBe('uuid-manish');
    });

    it('returns null if no advisor matches', () => {
      expect(resolveAdvisorId('Random Person', '9999999999', mockProfiles)).toBeNull();
    });
  });

  describe('parseIvrCsvText', () => {
    const sampleCsv = `Number,AgentNumber,AgentName,Dialtime,CustomerAnstime,CustHangTime,Call Duration,Dialstatus,PressedKey
8744875331,9311290543,Shivam Yadav,2026-09-15 15:55:29,2026-09-15 15:55:39,2026-09-15 15:57:22,103,NOANSWER,2
8920260621,9870345702,Shikha Tomar,2026-09-15 15:55:10,2026-09-15 15:55:42,2026-09-15 15:57:01,79,ANSWER,1
7088399647,9315964031,Khushi Pal,2026-09-15 15:56:10,2026-09-15 15:56:19,2026-09-15 15:56:39,20,NOANSWER,1
8057493106,9217085407,Manish,2026-09-15 15:55:56,2026-09-15 15:56:16,2026-09-15 15:56:38,22,NOANSWER,`;

    it('parses CSV records into strongly-typed objects', () => {
      const records = parseIvrCsvText(sampleCsv);
      expect(records).toHaveLength(4);

      expect(records[0]).toEqual({
        customer_phone: '8744875331',
        agent_number: '9311290543',
        agent_name: 'Shivam Yadav',
        dial_time: '2026-09-15 15:55:29',
        customer_ans_time: '2026-09-15 15:55:39',
        customer_hang_time: '2026-09-15 15:57:22',
        call_duration: 103,
        dial_status: 'NOANSWER',
        pressed_key: '2',
        temperature: 'hot',
      });

      expect(records[1].dial_status).toBe('ANSWER');
      expect(records[1].temperature).toBe('hot');

      expect(records[2].customer_phone).toBe('7088399647');
      expect(records[2].temperature).toBe('hot'); // pressed key 1

      expect(records[3].customer_phone).toBe('8057493106');
      expect(records[3].pressed_key).toBeNull();
      expect(records[3].temperature).toBe('warm'); // 22 seconds
    });
  });
});
