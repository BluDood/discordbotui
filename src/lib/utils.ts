import axios from 'axios'
import { API_URL } from './constants.ts'
import { tokenStore } from './stores.ts'
import { get } from 'svelte/store'

export const req = axios.create({
  baseURL: API_URL!,
  validateStatus: () => true
})

req.interceptors.request.use(req => {
  const token = get(tokenStore)
  if (token) req.headers.Authorization = `Bot ${token}`

  return req
})
