const API_BASE_URL = 'http://localhost:5000/api';

const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    ALL_USERS: `${API_BASE_URL}/auth/all`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/profile`,
  },
  
  // Question endpoints
  QUESTIONS: {
    BASE: `${API_BASE_URL}/questions`,
    BY_ID: (id) => `${API_BASE_URL}/questions/${id}`,
    ANSWERS: (id) => `${API_BASE_URL}/questions/${id}/answers`,
    HELPFUL: (questionId, answerId) => 
      `${API_BASE_URL}/questions/${questionId}/answers/${answerId}/helpful`,
  },
  
  // Course endpoints
  COURSES: {
    BASE: `${API_BASE_URL}/courses`,
    BY_ID: (id) => `${API_BASE_URL}/courses/${id}`,
    ENROLL: (id) => `${API_BASE_URL}/courses/${id}/enroll`,
    COMMENT: (id) => `${API_BASE_URL}/courses/${id}/comment`,
  },
  
  // User endpoints
  USERS: {
    PROFILE: (id) => `${API_BASE_URL}/users/profile/${id}`,
    INCREMENT_QUESTION: (id) => `${API_BASE_URL}/users/increment-question/${id}`,
    INCREMENT_ANSWER: (id) => `${API_BASE_URL}/users/increment-answer/${id}`,
    INCREMENT_HELPFUL: (id) => `${API_BASE_URL}/users/increment-helpful/${id}`,
  },
  
  // Category endpoints
  CATEGORIES: {
    BASE: `${API_BASE_URL}/categories`,
  },
};

export default API_ENDPOINTS; 