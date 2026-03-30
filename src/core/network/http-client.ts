import axios from 'axios'
import { env } from '../config/env'

export function createHttpClient() {
  return axios.create({
    baseURL: env.apiBaseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
