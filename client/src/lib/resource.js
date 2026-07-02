import { http } from "./http";

/**
 * Generic REST resource factory. Given a collection path, returns a typed set
 * of CRUD methods that any resource can reuse — the frontend half of the
 * "use generics" goal. Pair it with {@link useCollection} for stateful lists.
 *
 * @param {string} path - collection path, e.g. "/tasks/api/v1/tasks/"
 */
export function createResource(path) {
  const detail = (id) => `${path}${id}/`;
  return {
    path,
    list: (params, config) =>
      http.get(path, { params, ...config }).then((r) => r.data),
    retrieve: (id) => http.get(detail(id)).then((r) => r.data),
    create: (data) => http.post(path, data).then((r) => r.data),
    update: (id, data) => http.put(detail(id), data).then((r) => r.data),
    patch: (id, data) => http.patch(detail(id), data).then((r) => r.data),
    remove: (id) => http.delete(detail(id)).then(() => id),
    reorder: (order) =>
      http.post(`${path}reorder/`, { order }).then((r) => r.data),
  };
}

/**
 * Normalize a DRF list response whether it is paginated
 * (`{ count, next, results }`) or a bare array.
 */
export function unwrapPage(data) {
  if (Array.isArray(data)) {
    return { items: data, count: data.length, next: null };
  }
  return {
    items: data?.results ?? [],
    count: data?.count ?? 0,
    next: data?.next ?? null,
  };
}
