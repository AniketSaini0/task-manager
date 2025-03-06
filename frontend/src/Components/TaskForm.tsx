import { useState } from "react";
import { Task, TaskFormProps, StatusEnum } from "../types/index";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TaskForm({
  task,
  onAddTask,
  onEditTask,
  onCancel,
  reloadTasks,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [dueDate, setDueDate] = useState(task?.dueDate || "");
  const [taskStatus, setStatus] = useState<StatusEnum>(
    task?.status || StatusEnum.TODO
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Omit<Task, "id"> = {
      title,
      description,
      dueDate,
      status: taskStatus,
      isCompleted: taskStatus === StatusEnum.COMPLETED,
    };

    try {
      let response;
      if (task) {
        // Send POST request to the backend with credentials
        response = await fetch(`http://localhost:8000/api/tasks/${task.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTask),
        });

        // Handle success
        if (response.ok) {
          toast.success("Task Updated!");
          const UpdatedTask = await response.json();
          onEditTask?.(UpdatedTask);
          reloadTasks?.();
        }
      } else {
        // Send POST request to the backend with credentials
        response = await fetch(`http://localhost:8000/api/tasks/create-task`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTask),
        });

        // Handle success
        if (response.ok) {
          toast.success("Task Created!");
          const createdTask = await response.json();
          onAddTask?.(createdTask);
          reloadTasks?.();
        }
      }
    } catch {
      // Handle error
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-bold mb-4">
        {task ? "Edit Task" : "Add Task"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Due Date
          </label>
          <input
            id="description"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Task Status
          </label>
          <select
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => setStatus(e.target.value as StatusEnum)}
            defaultValue={taskStatus}
          >
            {/* <option defaultValue={taskStatus}>{taskStatus}</option> */}
            <option value={StatusEnum.TODO}>TODO</option>
            <option value={StatusEnum.PROGRESS}>PROGRESS</option>
            <option value={StatusEnum.COMPLETED}>COMPLETED</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {task ? "Save Changes" : "Add Task"}
          </button>
        </div>
      </form>
    </div>
  );
}
