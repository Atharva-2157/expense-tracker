import axios, { AxiosError } from "axios";
import { createBrowserHistory } from "history";

const history = createBrowserHistory();

const axiosClient = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      history.replace("/login");
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
