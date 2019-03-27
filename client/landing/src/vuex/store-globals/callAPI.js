import axios from 'axios';
import { config } from '../../config';

const callAPI = axios.create({
  baseURL: config.serverURL + '/api/',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

export { callAPI };
