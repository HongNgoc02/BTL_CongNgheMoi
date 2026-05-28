import axios from 'axios';
const api = axios.create({
   baseURL: 'http://44.200.231.22:5000/api',
   //baseURL: 'http://10.71.29.137:5000/api',
    headers: { 'Content-Type': 'application/json' },
});
export default api;