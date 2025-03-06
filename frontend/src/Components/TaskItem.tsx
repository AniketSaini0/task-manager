import { TaskItemProps } from "../types/index";
import { toast } from "react-toastify";

export default function TaskItem({
  task,
  onEdit,
  onDelete,
  onToggleCompletion,
  reloadTasks,
}: TaskItemProps) {
  const handleDelete = async () => {
    try {
      let response;
      if (task) {
        // Send POST request to the backend with credentials
        response = await fetch(`http://localhost:8000/api/tasks/${task.id}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        // Handle success
        if (response.ok) {
          toast.success("Task Updated!");
          reloadTasks?.();
          onDelete();
        } else {
          console.log(data.message);
        }
      }
    } catch {
      // Handle error
    }
  };
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={task.isCompleted}
            onChange={onToggleCompletion}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <h3
              className={`text-lg font-medium ${
                task.isCompleted
                  ? "line-through text-gray-500"
                  : "text-gray-900"
              }`}
            >
              {task.title}
            </h3>
            <p
              className={`text-sm text-gray-600 ${
                task.isCompleted ? "line-through" : ""
              }`}
            >
              {task.description}
            </p>
            <p
              className={`text-md text-gray-600 ${
                task.isCompleted ? "line-through" : ""
              }`}
            >
              status: {task.status}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete()}
            className="text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
