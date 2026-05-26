import axios from 'axios';

const BASE_URL = 'http://localhost:5000';
// const BASE_URL = 'http://192.168.37.1:5173';
const api = axios.create({ baseURL: BASE_URL, timeout: 120000 });

export const analyzeLogFile = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  const res = await api.post('/api/analyze', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getHistory  = async ()                    => (await api.get('/api/history')).data;
export const getAnalysis = async (id, page=1, rf='All') =>
  (await api.get(`/api/analysis/${id}`, { params: { page, risk_filter: rf } })).data;

export const clearHistory = async () => (await api.post('/api/history/clear')).data;

export const getCsvUrl = (id) => `${BASE_URL}/api/export/csv/${id}`;
export const getPdfUrl = (id) => `${BASE_URL}/api/export/pdf/${id}`;
