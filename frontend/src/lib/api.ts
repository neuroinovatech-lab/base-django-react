export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}
let csrfToken = ''
async function getCsrf() {
  const response = await fetch('/api/auth/csrf/', { credentials: 'same-origin' })
  if (!response.ok) throw new ApiError(response.status, 'Não foi possível conectar ao servidor.')
  csrfToken = (await response.json()).csrfToken
}
function errorMessage(data: unknown): string {
  if (typeof data === 'string') return data
  if (Array.isArray(data)) return data.map(errorMessage).join(' ')
  if (data && typeof data === 'object') return Object.values(data).map(errorMessage).join(' ')
  return 'Não foi possível concluir a operação.'
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method || 'GET'
  const mutation = !['GET', 'HEAD', 'OPTIONS'].includes(method)
  // Fetch a fresh token for writes: Django rotates it at login/password changes.
  if (mutation) await getCsrf()
  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(mutation ? { 'X-CSRFToken': csrfToken } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('Sem conexão com o servidor. Verifique se o backend está em execução.')
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({
      detail: 'Não foi possível concluir a operação. Atualize a página e tente novamente.',
    }))
    if (response.status === 403 && path !== '/auth/me/' && !path.startsWith('/auth/login')) {
      const session = await fetch('/api/auth/me/', { credentials: 'same-origin' })
      if (session.status === 403) window.dispatchEvent(new Event('session-expired'))
    }
    throw new ApiError(response.status, errorMessage(data))
  }
  return response.status === 204 ? (undefined as T) : response.json()
}
