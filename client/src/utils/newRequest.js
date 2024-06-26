import axios from "axios";

const newRequest = axios.create({
  baseURL: "https://rudra-app-backend.vercel.app/api/",
  withCredentials: true,
});

export default newRequest;
