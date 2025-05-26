import apiClient from "./apiClient";

// GET /challenges/?page=1
export const getChallenges = async (token: string | null) => {
  try {
    const response = await apiClient.get(`/ecity/challenges`);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching challenges:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// POST /challenges/
export const createChallenge = async (data: any) => {
  try {
    const response = await apiClient.post("/ecity/Activity/submissions", data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating challenge:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// GET /challenges/{id}/
export const getChallengeById = async (id: string) => {
  try {
    const response = await apiClient.get(`/challenges/${id}/`);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching challenge by ID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// GET /Activity/submissions/
export const getSubmissions = async () => {
  try {
    const response = await apiClient.get(`/Activity/submissions/`);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching submissions:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// POST /Activity/submissions/
export const createSubmission = async (data: any) => {
  try {
    const response = await apiClient.post(`/Activity/submissions/`, data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating submission:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// GET /Activity/submissions/{id}/
export const getSubmissionById = async (id: string) => {
  try {
    const response = await apiClient.get(`/Activity/submissions/${id}/`);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching submission by ID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// DELETE /Activity/submissions/{id}/
export const deleteSubmissionById = async (id: string) => {
  try {
    const response = await apiClient.delete(`/Activity/submissions/${id}/`);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting submission:",
      error.response?.data || error.message
    );
    throw error;
  }
};
