import axios from "axios";

const tasksUrl = axios.create({
  baseURL: "http://localhost:8000/tasks/api/v1/tasks/",
});

export const getTask = (id) => tasksUrl.get(`/${id}/`);

export const getAllTasks = () => tasksUrl.get("/");

export const createTask = (task) => tasksUrl.post("/", task);

export const deleteTask = (id) => tasksUrl.delete(`/${id}`);

export const updateTask = (id, task) => tasksUrl.put(`/${id}/`, task);
