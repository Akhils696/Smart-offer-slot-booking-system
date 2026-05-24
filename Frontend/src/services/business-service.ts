import { apiClient } from '../api/client'
import { API_ENDPOINTS } from '../constants/api'
import type { ApiResponse } from '../types/api'
import type { BusinessSummary, UpsertBusinessPayload } from '../types/business'

export async function getBusinesses() {
  const response = await apiClient.get<ApiResponse<BusinessSummary[]>>(API_ENDPOINTS.businesses)
  return response.data.data ?? []
}

export async function createBusiness(payload: UpsertBusinessPayload) {
  const response = await apiClient.post<ApiResponse<BusinessSummary>>(API_ENDPOINTS.businesses, payload)
  return response.data
}

export async function updateBusiness(businessId: string, payload: UpsertBusinessPayload) {
  const response = await apiClient.put<ApiResponse<BusinessSummary>>(`${API_ENDPOINTS.businesses}/${businessId}`, payload)
  return response.data
}
