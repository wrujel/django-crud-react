import axios from "axios";

const tasksUrl = axios.create({
  baseURL: "http://localhost:8000/tasks/api/v1/tasks/",
});

export const getAllTasks = () => tasksUrl.get("/");

export const createTask = (task) => tasksUrl.post("/", task);

export const deleteTask = (id) => tasksUrl.delete(`/${id}`);
