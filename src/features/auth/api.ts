import { apiJson } from '@/lib/http';
import type { MeResponse } from './types';

export function fetchMe(): Promise<MeResponse> {
    return apiJson('/usuarios/me', 'Failed to fetch user profile');
}
