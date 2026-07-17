import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export async function scanBarcode(barcode) {
  const { data } = await client.get(`/scan/${barcode}`);
  return data;
}

export async function searchProducts(params) {
  const { data } = await client.get('/products', { params });
  return data;
}

export async function getHistory(params) {
  const { data } = await client.get('/dashboard/history', { params });
  return data;
}

export async function getStats(params) {
  const { data } = await client.get('/dashboard/stats', { params });
  return data;
}

export default client;
