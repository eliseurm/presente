// Simple API client with Authorization header injection.
// Token management: expects a token stored in localStorage under key 'access_token'.

export function setToken(token) {
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
}

export function getToken() {
  return localStorage.getItem('access_token');
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');
  const resp = await fetch(path, { ...options, headers });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`HTTP ${resp.status} ${resp.statusText} - ${text}`);
  }
  const contentType = resp.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return resp.json();
  return resp.text();
}

// Convenience API calls
export const EventoApi = {
  listarEventos: (params = new URLSearchParams({ page: '0', size: '10', sort: 'id', direction: 'ASC' })) =>
    apiFetch(`/api/evento?${params.toString()}`),
  iniciar: (id, baseUrl) => apiFetch(`/api/evento/${id}/iniciar`, { method: 'POST', body: JSON.stringify({ baseUrl }) }),
  parar: (id) => apiFetch(`/api/evento/${id}/parar`, { method: 'POST' }),
  ultimaEscolha: (eventoId, pessoaId) => apiFetch(`/api/evento/${eventoId}/pessoas/${pessoaId}/escolha/ultima`),
  historicoEscolhas: (eventoId, pessoaId) => apiFetch(`/api/evento/${eventoId}/pessoas/${pessoaId}/escolha/historico`),
};

export const ProdutoApi = {
  listar: (params = new URLSearchParams({ page: '0', size: '9999', sort: 'id', direction: 'ASC' })) =>
    apiFetch(`/api/produto?${params.toString()}`),
};

export const PresenteApi = {
  carregar: (token) => apiFetch(`/presente/${encodeURIComponent(token)}`),
  escolher: (token, payload) => apiFetch(`/presente/${encodeURIComponent(token)}/escolher`, { method: 'POST', body: JSON.stringify(payload) }),
  historico: (token) => apiFetch(`/presente/${encodeURIComponent(token)}/historico`),
};
