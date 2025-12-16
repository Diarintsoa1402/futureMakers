// services/chat.js
import API from "./api";

// Conversations privées
export const getOrCreateConversation = (data) => 
  API.post("/chat/conversations", data);

export const getConversations = () => 
  API.get("/chat/conversations");

export const getMessages = (convId) => 
  API.get(`/chat/conversations/${convId}/messages`);

export const postMessage = (data) => 
  API.post("/chat/messages", data);

// Groupes
export const createGroup = (data) => 
  API.post("/chat/groups", data);

export const getGroups = () => 
  API.get("/chat/groups");

export const getGroupMessages = (groupId) => 
  API.get(`/chat/groups/${groupId}/messages`);

export const addGroupMember = (groupId, userId) =>
  API.post(`/chat/groups/${groupId}/members`, { userId });

export const removeGroupMember = (groupId, userId) =>
  API.delete(`/chat/groups/${groupId}/members/${userId}`);

// Upload fichier
export const uploadFile = (formData) => 
  API.post("/chat/upload", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

// Marquer messages comme lus
export const markAsRead = (conversationId) =>
  API.put(`/chat/conversations/${conversationId}/read`);

export const getUsers = () => API.get("/chat/users");

