import type {CookieRef} from "#app";
import type {TypedInternalResponse} from "nitropack";
interface ApiResponse {
  code: number
  message: string
  payload: object | object[] | null,
  page?: number
  size?: number
  pages?: number
}
export function $api<T>(
  request: Parameters<typeof $fetch<T>>[0],
  opts?: Parameters<typeof $fetch<T>>[1],
  timeout: number = 5000
): Promise<ApiResponse | Error | TypedInternalResponse<any>> {
  const auth = useAuthStore()
  const authToken: CookieRef<string | null | undefined> = useCookie('authToken')
  const config = useRuntimeConfig().public

  const abortController: AbortController = new AbortController()
  let requestString: string = request?.toString() || ''
  if (requestString.startsWith('/')) requestString = requestString.substring(1)
  const requestPath: string = [config.API_URL,
    config.API_VERSION,
    requestString].join('/')
  const timer: NodeJS.Timeout = setTimeout(() => abortController.abort(), timeout)
  // console.log('request accessToken', auth.accessToken)
  return $fetch<T>(requestPath, {
    ...opts,
    headers: {
      Authorization: (auth.accessToken || authToken.value) ? `Bearer ${auth.accessToken || authToken.value}` : '',
      ...opts?.headers
    }
  }).catch((e: any) => {
    if (import.meta.env.NODE_ENV !== 'production') {
      console.error('FETCH Error: ', e.data)
    }
    return Promise.reject(e)
  })
}
