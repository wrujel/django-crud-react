import { http } from "../lib/http";
import { createResource } from "../lib/resource";

const TASKS_PATH = "/tasks/api/v1/tasks/";

/**
 * Tasks API: generic CRUD from createResource() plus the custom `stats`
 * aggregate endpoint exposed by the DRF viewset.
 */
export const tasksApi = {
  ...createResource(TASKS_PATH),
  stats: () => http.get(`${TASKS_PATH}stats/`).then((r) => r.data),
};
