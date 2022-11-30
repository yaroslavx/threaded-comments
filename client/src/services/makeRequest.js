import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
  withCredentials: true,
});

export const makeRequest = (url, options) => {
  return api(url, options)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err?.response?.data?.message ?? 'Error'));
};
