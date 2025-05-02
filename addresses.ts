const isDev: boolean = process.env.NODE_ENV === 'development'

export const localIPAddress: string = '127.0.0.1:8080'
export const productionAddress: string = '127.0.0.1'
export const connectionAddress: string = isDev ? localIPAddress : productionAddress
export const API_URL = `${isDev ? 'http://' : 'https://'}${connectionAddress}`
