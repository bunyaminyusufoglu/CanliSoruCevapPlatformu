import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || '/api';
const API = axios.create({ baseURL });

export const register = (userData) => API.post('/auth/register', userData);
export const registerAdmin = (userData) => API.post('/auth/register-admin', userData);
export const login = (userData) => API.post('/auth/login', userData);
export const getUser = (userId) => API.get(`/auth/user/${userId}`);
export const updateUser = (userId, userData) => API.put(`/auth/user/${userId}`, userData);
export const deleteUser = (userId) => API.delete(`/auth/user/${userId}`);


