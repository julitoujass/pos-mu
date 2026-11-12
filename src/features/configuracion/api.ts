import { apiJson } from '@/lib/http';
import type { BusinessSettings, BusinessSettingsUpdate } from './types';

/** Business data and rules. Readable by any user. */
export function fetchSettings(): Promise<BusinessSettings> {
    return apiJson('/configuracion', 'Failed to fetch settings');
}

/** Admin only. Partial update; returns the saved settings. */
export function updateSettings(data: BusinessSettingsUpdate): Promise<BusinessSettings> {
    return apiJson('/configuracion', 'Failed to update settings', { method: 'PATCH', body: data });
}
