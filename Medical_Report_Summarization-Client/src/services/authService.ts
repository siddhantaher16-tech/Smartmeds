import api from "../lib/axios";
import type { Profile, ApiResponse } from "../types";

export interface AuthResponse {
  user: { id: string; email: string };
  profile: Profile;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export const login = async (
  email: string,
  password: string,
): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const signup = async (
  fullName: string,
  email: string,
  password: string,
  role = "patient",
): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post("/auth/signup", {
    full_name: fullName,
    email,
    password,
    role,
  });
  return response.data;
};

export const getMe = async (): Promise<ApiResponse<{ profile: Profile }>> => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateProfile = async (
  fields: Partial<Profile>,
): Promise<ApiResponse<Profile>> => {
  const response = await api.put("/profile/medical", fields);
  return response.data;
};

export const updateDoctorProfile = async (fields: {
  specialisation?: string;
  bio?: string;
}): Promise<ApiResponse<Profile>> => {
  const response = await api.put("/profile/doctor", fields);
  return response.data;
};
