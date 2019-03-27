import axios from 'axios';
import $cookies from 'js-cookie';
import { config } from '../../config';

const callAPI = axios.create({
  baseURL: config.serverURL + '/api/',
  headers: {
    'Authorization': `Bearer ${$cookies.get('jwt')}`
  }
});

export { callAPI };
