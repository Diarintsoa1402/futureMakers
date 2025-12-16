/* FICHIER: src/services/course.js */
import API from "./api";

// Côté enfant/utilisateur
export const getAllCourses = (params) => API.get("/courses", { params });
export const getCourseById = (id) => {
  const token = localStorage.getItem("token");
  return API.get(`/courses/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const saveProgress = (data) => API.post("/courses/progress", data);
export const completeSupport = (data) => API.post("/courses/progress/complete-support", data);
export const getProgress = (userId) => API.get(`/courses/progress/${userId}`);
export const getCategories = () => API.get("/courses/categories");
export const searchCourses = (query) => API.get("/courses/search", { params: query });

// Côté admin
export const getAllCoursesAdmin = (params) => API.get("/admin/courses", { params });
export const getCourseStats = () => API.get("/admin/courses/stats");
export const createCourse = (data) => API.post("/admin/courses", data);
export const updateCourse = (id, data) => API.put(`/admin/courses/${id}`, data);
export const togglePublishCourse = (id) => API.patch(`/admin/courses/${id}/publish`);
export const deleteCourse = (id) => API.delete(`/admin/courses/${id}`);
export const duplicateCourse = (id) => API.post(`/admin/courses/${id}/duplicate`);