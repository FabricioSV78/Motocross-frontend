import { apiClient } from '@/services/apiClient';

export interface CompanyItem {
  id: number;
  email: string;
  nombre: string;
  nombre_empresa: string | null;
  telefono: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string | null;
}

export interface ApproveCompanyResponse {
  message: string;
  companyId: number;
  status: string;
}

// ---------------------------------------------------------------------------
// HU-25: Proveedores
// ---------------------------------------------------------------------------

export interface PendingProviderItem {
  id: number;
  name: string;
  email: string;
  type: 'COACH' | 'COMPANY';
  status: string;
  certificate_url?: string;
}

export interface VerifyProviderRequest {
  providerType: 'COACH' | 'COMPANY';
  status: 'APPROVED' | 'REJECTED';
}

export interface VerifyProviderResponse {
  message: string;
  providerId: number;
  providerType: string;
  status: string;
}

/**
 * Obtener lista de empresas (solo ADMIN).
 * @param statusFilter - Si se pasa, filtra por ese estado (ej: "PENDING")
 */
export async function getCompanies(statusFilter?: string): Promise<CompanyItem[]> {
  const params = statusFilter ? { status: statusFilter } : {};
  const { data } = await apiClient.get<CompanyItem[]>('/admin/companies', { params });
  return data;
}

/**
 * Aprobar una empresa (solo ADMIN). HU-24.
 */
export async function approveCompany(companyId: number): Promise<ApproveCompanyResponse> {
  const { data } = await apiClient.put<ApproveCompanyResponse>(
    `/admin/companies/${companyId}/approve`
  );
  return data;
}

/**
 * Obtener proveedores pendientes (coaches + empresas). HU-25.
 * @deprecated Usar getProviders({ status: 'PENDING' })
 */
export async function getPendingProviders(): Promise<PendingProviderItem[]> {
  const { data } = await apiClient.get<PendingProviderItem[]>('/admin/providers/pending');
  return data;
}

/**
 * Obtener proveedores (coaches + empresas) con filtro opcional de status. HU-25.
 */
export async function getProviders(statusFilter?: string): Promise<PendingProviderItem[]> {
  const params = statusFilter ? { status: statusFilter } : {};
  const { data } = await apiClient.get<PendingProviderItem[]>('/admin/providers', { params });
  return data;
}

/**
 * Aprobar o rechazar un proveedor (coach o empresa). HU-25.
 */
export async function verifyProvider(
  providerId: number,
  body: VerifyProviderRequest
): Promise<VerifyProviderResponse> {
  const { data } = await apiClient.put<VerifyProviderResponse>(
    `/admin/verify-provider/${providerId}`,
    body
  );
  return data;
}

