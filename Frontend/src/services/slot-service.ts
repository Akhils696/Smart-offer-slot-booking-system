import { apiClient } from '../api/client'
import type { ApiResponse } from '../types/api'
import type { SlotSummary, UpsertSlotPayload } from '../types/slot'

export async function getSlots(offerId: string) {
  const response = await apiClient.get<ApiResponse<SlotSummary[]>>(`/slots/offers/${offerId}`)
  return response.data.data ?? []
}

export async function createSlot(payload: UpsertSlotPayload) {
  const response = await apiClient.post<ApiResponse<SlotSummary>>('/slots', payload)
  return response.data
}

export async function updateSlot(slotId: string, payload: UpsertSlotPayload) {
  const response = await apiClient.put<ApiResponse<SlotSummary>>(`/slots/${slotId}`, payload)
  return response.data
}

export async function deleteSlot(slotId: string) {
  const response = await apiClient.delete<ApiResponse<object>>(`/slots/${slotId}`)
  return response.data
}
