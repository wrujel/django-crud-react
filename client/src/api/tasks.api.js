import axios from "axios";

const URL =
  // eslint-disable-next-line no-undef
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:8000";

const tasksUrl = axios.create({
  baseURL: `${URL}/tasks/api/v1/tasks/`,
});

export const getTask = (id) => tasksUrl.get(`/${id}/`);

export const getAllTasks = () => tasksUrl.get("/");

export const createTask = (task) => tasksUrl.post("/", task);

export const deleteTask = (id) => tasksUrl.delete(`/${id}`);

export const updateTask = (id, task) => tasksUrl.put(`/${id}/`, task);
