import { describe, expect, it } from 'vitest';
import { getApiErrorDetail, getErrorMessage } from './errors';

describe('getErrorMessage', () => {
    it('returns the message of an Error', () => {
        expect(getErrorMessage(new Error('boom'), 'fallback')).toBe('boom');
    });

    it('returns the fallback when the Error message is empty', () => {
        expect(getErrorMessage(new Error(''), 'fallback')).toBe('fallback');
    });

    it('reads message from plain objects', () => {
        expect(getErrorMessage({ message: 'plain' }, 'fallback')).toBe('plain');
    });

    it('returns the fallback for non-string messages', () => {
        expect(getErrorMessage({ message: 42 }, 'fallback')).toBe('fallback');
    });

    it.each([null, undefined, 'text', 123])('returns the fallback for %s', (value) => {
        expect(getErrorMessage(value, 'fallback')).toBe('fallback');
    });
});

describe('getApiErrorDetail', () => {
    it('returns string details', () => {
        expect(getApiErrorDetail({ detail: 'No hay caja abierta' }, 'fb')).toBe('No hay caja abierta');
    });

    it('returns the first message of an array detail', () => {
        expect(getApiErrorDetail({ detail: [{ msg: 'bad value' }, { msg: 'other' }] }, 'fb')).toBe('bad value');
    });

    it('falls back for missing or malformed details', () => {
        expect(getApiErrorDetail({}, 'fb')).toBe('fb');
        expect(getApiErrorDetail(null, 'fb')).toBe('fb');
        expect(getApiErrorDetail({ detail: [] }, 'fb')).toBe('fb');
        expect(getApiErrorDetail({ detail: [{}] }, 'fb')).toBe('fb');
        expect(getApiErrorDetail({ detail: '' }, 'fb')).toBe('fb');
    });
});
