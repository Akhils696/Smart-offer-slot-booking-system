import { apiClient } from '../api/client'
import { API_ENDPOINTS } from '../constants/api'
import type { ApiResponse, PagedResult } from '../types/api'
import type { OfferQuery, OfferSummary, UpsertOfferPayload } from '../types/offer'

export async function getOffers(query: OfferQuery) {
  const response = await apiClient.get<ApiResponse<PagedResult<OfferSummary>>>(API_ENDPOINTS.offers, { params: query })
  return response.data.data
}

export async function createOffer(payload: UpsertOfferPayload) {
  const response = await apiClient.post<ApiResponse<OfferSummary>>(API_ENDPOINTS.offers, payload)
  return response.data
}

export async function updateOffer(offerId: string, payload: UpsertOfferPayload) {
  const response = await apiClient.put<ApiResponse<OfferSummary>>(`${API_ENDPOINTS.offers}/${offerId}`, payload)
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
