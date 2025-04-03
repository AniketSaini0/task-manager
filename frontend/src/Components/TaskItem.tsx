import { useDispatch } from "react-redux";
import { useState } from "react";
import { deleteTask, toggleTaskCompletion } from "../redux/slices/task.slice";
import { AppDispatch } from "../redux/store";
import { TaskItemProps } from "../types";
import { toast } from "react-toastify";
import TaskForm from "../Components/TaskForm";

// onDelete gives error of declaring but not used
export default function TaskItem({ task }: TaskItemProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [isEditing, setIsEditing] = useState(false);

  // the same method is in TashDashboard, which makes it redundent.
  // const handleEdit = (taskId: string) => {
  //   dispatch(editTask(taskId));
  //   toast.success("Task Deleted!");
  // };

  const handleDelete = (taskId: string) => {
    dispatch(deleteTask(taskId));
    toast.success("Task Deleted!");
  };

  const handleToggleCompletion = (taskId: string) => {
    dispatch(toggleTaskCompletion(taskId));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {isEditing ? (
        <TaskForm
          task={task}
          onSubmit={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={task.isCompleted}
              onChange={() => handleToggleCompletion(task._id)}
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
                Status: {task.status}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => setIsEditing(true)} // On clicking , this should trigger the visibility of form with the data of current task
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(task._id)}
              className="text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
