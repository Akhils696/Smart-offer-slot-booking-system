import { apiClient } from '../api/client'
import { API_ENDPOINTS } from '../constants/api'
import type { ApiResponse, PagedResult } from '../types/api'
import type { OfferQuery, OfferSummary, UpsertOfferPayload } from '../types/offer'

/**
 * Convert a datetime-local string (e.g. "2026-05-25T10:23") to a full ISO string
 * with UTC offset so .NET DateTimeOffset parses it correctly.
 */
function toIsoString(localDatetime: string): string {
  if (!localDatetime) return localDatetime
  // new Date() interprets datetime-local as local time, then .toISOString() gives UTC
  return new Date(localDatetime).toISOString()
}

function serializeOfferPayload(payload: UpsertOfferPayload) {
  return {
    ...payload,
    startsAt: toIsoString(payload.startsAt),
    endsAt: toIsoString(payload.endsAt),
  }
}

export async function getOffers(query: OfferQuery) {
  const response = await apiClient.get<ApiResponse<PagedResult<OfferSummary>>>(API_ENDPOINTS.offers, { params: query })
  return response.data.data
}

export async function createOffer(payload: UpsertOfferPayload) {
  const response = await apiClient.post<ApiResponse<OfferSummary>>(API_ENDPOINTS.offers, serializeOfferPayload(payload))
  return response.data
}

export async function updateOffer(offerId: string, payload: UpsertOfferPayload) {
  const response = await apiClient.put<ApiResponse<OfferSummary>>(`${API_ENDPOINTS.offers}/${offerId}`, serializeOfferPayload(payload))
  return response.data
}

export async function activateOffer(offerId: string) {
  const response = await apiClient.post<ApiResponse<OfferSummary>>(`${API_ENDPOINTS.offers}/${offerId}/activate`)
  return response.data
}

export async function pauseOffer(offerId: string) {
  const response = await apiClient.post<ApiResponse<OfferSummary>>(`${API_ENDPOINTS.offers}/${offerId}/pause`)
  return response.data
}

export async function deleteOffer(offerId: string) {
  const response = await apiClient.delete<ApiResponse<object>>(`${API_ENDPOINTS.offers}/${offerId}`)
  return response.data
}

export async function getOfferById(offerId: string) {
  const response = await apiClient.get<ApiResponse<OfferSummary>>(`${API_ENDPOINTS.offers}/${offerId}`)
  return response.data.data
}
