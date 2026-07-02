import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Inbox, Plus, SearchX } from "lucide-react";

import { tasksApi } from "../api/tasks.api";
import { useCollection } from "../hooks/useCollection";
import { useStats } from "../hooks/useStats";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { getErrorMessage } from "../lib/http";

import { Navbar } from "../components/Navbar";
import { StatsDashboard } from "../components/StatsDashboard";
import { TaskToolbar } from "../components/TaskToolbar";
import { TaskGrid } from "../components/TaskGrid";
import { TaskList } from "../components/TaskList";
import { TaskFormModal } from "../components/TaskFormModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("");
  const [sort, setSort] = useLocalStorage("taskSort", "");
  const [view, setView] = useLocalStorage("taskView", "grid");

  // `search` already holds the debounced value (SearchInput debounces locally).
  const params = useMemo(() => {
    const next = {};
    const term = search.trim();
    if (term) next.search = term;
    if (status === "active") next.completed = false;
    if (status === "completed") next.completed = true;
    if (priority) next.priority = priority;
    if (sort) next.ordering = sort;
    return next;
  }, [search, status, priority, sort]);

  const tasks = useCollection(tasksApi, params);
  const [stats, reloadStats] = useStats(tasksApi.stats);

  const [form, setForm] = useState({ open: false, task: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => setForm({ open: true, task: null });
  const openEdit = (task) => setForm({ open: true, task });
  const closeForm = () => setForm((prev) => ({ ...prev, open: false }));

  const handleSubmit = async (data) => {
    try {
      if (form.task) {
        await tasks.update(form.task.id, data);
        toast.success("Task updated");
      } else {
        await tasks.create(data);
        toast.success("Task created");
      }
      reloadStats();
      closeForm();
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err; // keep the modal open so the user can retry
    }
  };

  const handleToggle = async (task) => {
    try {
      await tasks.patch(task.id, { completed: !task.completed });
      reloadStats();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const requestDelete = (task) => {
    setForm((prev) => ({ ...prev, open: false }));
    setDeleteTarget(task);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await tasks.remove(deleteTarget.id);
      toast.success("Task deleted");
      reloadStats();
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPriority("");
  };

  // Live reorder during a drag (no request); persist + switch to Manual sort
  // once the drag drops or an arrow is pressed.
  const applyReorder = (ordered) => tasks.setItems(ordered);

  const persistOrder = async (ordered) => {
    try {
      await tasks.reorder(ordered);
      if (sort !== "position") setSort("position");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const moveTask = (task, direction) => {
    const items = tasks.items;
    const from = items.findIndex((t) => t.id === task.id);
    const to = from + direction;
    if (from === -1 || to < 0 || to >= items.length) return;
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    persistOrder(next);
  };

  const hasFilters = Boolean(params.search || status !== "all" || priority);
  const reorderable = view === "list" && !hasFilters;
  const Collection = view === "list" ? TaskList : TaskGrid;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pt-8 pb-24 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            Your tasks
          </h1>
          <p className="mt-1 text-sm text-muted">
            Plan, prioritize, and track everything in one place.
          </p>
        </div>

        <StatsDashboard stats={stats} className="mb-8" />

        <TaskToolbar
          search={search}
          onSearch={setSearch}
          status={status}
          onStatus={setStatus}
          priority={priority}
          onPriority={setPriority}
          sort={sort}
          onSort={setSort}
          view={view}
          onView={setView}
          onAddTask={openCreate}
          refreshing={tasks.isRefreshing}
          className="mb-6"
        />

        {tasks.isError ? (
          <EmptyState
            icon={Inbox}
            title="Couldn't load tasks"
            description="Make sure the API server is running, then try again."
            action={
              <Button variant="secondary" onClick={() => tasks.refresh()}>
                Retry
              </Button>
            }
          />
        ) : (
          <Collection
            tasks={tasks.items}
            isLoading={tasks.isLoading}
            isLoadingMore={tasks.isLoadingMore}
            hasMore={tasks.hasMore}
            onLoadMore={tasks.loadMore}
            onToggle={handleToggle}
            onEdit={openEdit}
            onDelete={requestDelete}
            reorderable={reorderable}
            onReorder={applyReorder}
            onReorderCommit={() => persistOrder(tasks.items)}
            onMoveUp={(task) => moveTask(task, -1)}
            onMoveDown={(task) => moveTask(task, 1)}
            emptyState={
              hasFilters ? (
                <EmptyState
                  icon={SearchX}
                  title="No matching tasks"
                  description="Try adjusting your search or filters."
                  action={
                    <Button variant="secondary" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={Inbox}
                  title="No tasks yet"
                  description="Create your first task to get started."
                  action={
                    <Button icon={Plus} onClick={openCreate}>
                      New task
                    </Button>
                  }
                />
              )
            }
          />
        )}
      </main>

      <TaskFormModal
        open={form.open}
        task={form.task}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onDelete={requestDelete}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete task?"
        description={
          deleteTarget
            ? `“${deleteTarget.title}” will be permanently removed.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
