import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const register = (userData) => API.post('/auth/register', userData);
export const login = (userData) => API.post('/auth/login', userData);
export const getUser = (userId) => API.get(`/auth/user/${userId}`);
export const updateUser = (userId, userData) => API.put(`/auth/user/${userId}`, userData);
export const deleteUser = (userId) => API.delete(`/auth/user/${userId}`);


