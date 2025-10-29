import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || '/api';
const API = axios.create({ baseURL });

// Request interceptor - her istekte token ekle
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 401 hatalarında logout
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const register = (userData) => API.post('/auth/register', userData);
export const registerAdmin = (userData) => API.post('/auth/register-admin', userData);
export const login = (userData) => API.post('/auth/login', userData);
export const getUser = (userId) => API.get(`/auth/user/${userId}`);
export const updateUser = (userId, userData) => API.put(`/auth/user/${userId}`, userData);
export const deleteUser = (userId) => API.delete(`/auth/user/${userId}`);

// Questions API
export const getQuestions = (params) => API.get('/questions', { params });
export const getQuestion = (id) => API.get(`/questions/${id}`);
export const createQuestion = (questionData) => API.post('/questions', questionData);
export const updateQuestion = (id, questionData) => API.put(`/questions/${id}`, questionData);
export const deleteQuestion = (id) => API.delete(`/questions/${id}`);
export const addAnswer = (questionId, answerData) => API.post(`/questions/${questionId}/answers`, answerData);
export const addReplyToAnswer = (questionId, answerId, replyData) => API.post(`/questions/${questionId}/answers/${answerId}/replies`, replyData);
export const acceptAnswer = (questionId, answerId) => API.put(`/questions/${questionId}/answers/${answerId}/accept`);

// Admin Questions API
export const adminListQuestions = () => API.get('/questions/admin/list');
export const adminDeleteQuestion = (id) => API.delete(`/questions/admin/${id}`);

// Image Upload API
export const uploadAvatar = (formData) => API.post('/images/avatar', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const uploadQuestionImage = (formData) => API.post('/images/question', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const uploadCourseImage = (formData) => API.post('/images/course', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const uploadImage = (formData) => API.post('/images/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Courses API
export const createCourse = (formData) => API.post('/courses', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateCourseWithFiles = (id, formData) => API.put(`/courses/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const addCourseComment = (payload) => API.post('/courses/comment', payload);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);

// Streams API
export const getStreams = () => API.get('/streams');
export const createStream = (payload) => API.post('/streams', payload);
export const addStreamComment = (payload) => API.post('/streams/comment', payload);
export const endStream = (id) => API.put(`/streams/${id}/end`);

// Admin Users API
export const adminListUsers = () => API.get('/auth/admin/users');
export const adminToggleUserAdmin = (userId) => API.put(`/auth/admin/users/${userId}/toggle-admin`);
export const adminDeleteUser = (userId) => API.delete(`/auth/admin/users/${userId}`);

// Admin Courses API
export const adminListCourses = () => API.get('/courses/admin/list');
export const adminUpdateCourse = (id, payload) => API.put(`/courses/admin/${id}`, payload);
export const adminDeleteCourse = (id) => API.delete(`/courses/${id}`);