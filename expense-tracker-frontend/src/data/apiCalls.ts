import axiosClient from "../api/axiosClient";
import { type User } from "./types";

export const fetchCurrentUser = async (): Promise<User> => {
  const response = await axiosClient.get("/api/expense-tracker/auth/me");
  return response.data?.data;
};
