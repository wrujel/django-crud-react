import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Trash2 } from "lucide-react";

import { PRIORITY_OPTIONS } from "../constants/tasks";
import { cn } from "../lib/cn";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Select } from "./ui/Select";
import { DatePicker } from "./ui/DatePicker";
import { Button } from "./ui/Button";

const EMPTY = { title: "", description: "", priority: 2, due_date: "" };

function Field({ label, htmlFor, error, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-muted"
      >
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}

export function TaskFormModal({ open, task, onClose, onSubmit, onDelete }) {
  const isEdit = Boolean(task);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(
      task
        ? {
            title: task.title ?? "",
            description: task.description ?? "",
            priority: task.priority ?? 2,
            due_date: task.due_date ?? "",
          }
        : EMPTY,
    );
  }, [open, task, reset]);

  const submit = handleSubmit(async (data) => {
    try {
      await onSubmit({
        title: data.title,
        description: data.description ?? "",
        priority: Number(data.priority),
        due_date: data.due_date || null,
      });
    } catch {
      /* the parent surfaces the error via toast and keeps the modal open */
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit task" : "New task"}
      description={
        isEdit ? "Update the details below." : "Add a task to your list."
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Title" htmlFor="title" error={errors.title?.message}>
          <Input
            id="title"
            placeholder="Title"
            autoFocus
            invalid={Boolean(errors.title)}
            {...register("title", { required: "Title is required" })}
          />
        </Field>

        <Field label="Description" htmlFor="description">
          <Textarea
            id="description"
            placeholder="Description"
            rows={4}
            {...register("description")}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority">
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  options={PRIORITY_OPTIONS}
                  ariaLabel="Priority"
                />
              )}
            />
          </Field>

          <Field label="Due date">
            <Controller
              name="due_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  ariaLabel="Due date"
                />
              )}
            />
          </Field>
        </div>

        <div className="flex items-center gap-3 pt-2">
          {isEdit && (
            <Button
              type="button"
              variant="danger"
              icon={Trash2}
              onClick={() => onDelete(task)}
              className="mr-auto"
            >
              Delete
            </Button>
          )}
          <div className={cn("flex items-center gap-3", !isEdit && "ml-auto")}>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Save
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
