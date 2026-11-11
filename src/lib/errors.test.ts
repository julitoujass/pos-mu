import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './errors';

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
