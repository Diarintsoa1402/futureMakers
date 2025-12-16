// ============================================
// frontend/src/services/quiz.js
// ============================================
import API from "./api";

// Services pour les enfants
export const getAllQuizzes = () => API.get("/quizzes");
export const getQuizById = (id) => API.get(`/quizzes/${id}`);
export const submitQuiz = (id, answers) => API.post(`/quizzes/${id}/submit`, { answers });
export const getMyResults = () => API.get("/quizzes/user/results");
export const getUserStats = () => API.get("/quizzes/user/stats");

// Services Admin
export const getAllQuizzesAdmin = () => API.get("/admin/quizzes");
export const createQuiz = (data) => API.post("/admin/quizzes", data);
export const updateQuiz = (id, data) => API.put(`/admin/quizzes/${id}`, data);
export const deleteQuiz = (id) => API.delete(`/admin/quizzes/${id}`);
export const addQuestion = (quizId, question) => API.post(`/admin/quizzes/${quizId}/questions`, question);
export const deleteQuestion = (questionId) => API.delete(`/admin/questions/${questionId}`);
