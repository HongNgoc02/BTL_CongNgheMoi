import axios from 'axios';
const api = axios.create({
   //baseURL: 'http://192.168.1.5:5000/api', 
   baseURL: 'http://10.17.87.137:5000/api',
    headers: { 'Content-Type': 'application/json' },
});
export default api;