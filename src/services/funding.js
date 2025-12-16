import API from "./api";

// FEMME
export const submitFunding = (data) => API.post("/fundings", data);

// INVESTISSEUR
export const getAllFundingRequests = () => API.get("/fundings");
export const reviewFunding = (id, data) => API.put(`/fundings/${id}`, data);
export const getFundedProjects = () => API.get("/fundings/funded");