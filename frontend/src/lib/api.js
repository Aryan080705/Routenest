import axios from "axios";
const baseURL = process.env.REACT_APP_BACKEND_URL || "";
export const api = axios.create({ baseURL });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
