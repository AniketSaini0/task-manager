import { useCallback, useEffect, useState } from "react";
import { Task, TaskDashboardProps } from "../types/index";
import TaskForm from "../Components/TaskForm";
import TaskItem from "../Components/TaskItem";

export default function TaskDashboard({
  tasks,
  onLoadTasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTaskCompletion,
  onLogout,
  userEmail,
}: TaskDashboardProps) {
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  // const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasks = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8000/api/tasks", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("email", userEmail);
      if (response.ok) {
        console.log("Tasks fetched", data);
        // Ensureing data is an array of tasks
        if (Array.isArray(data.data)) {
          onLoadTasks(data.data);
        } else {
          console.log("Create Tasks to view", data);
        }
      } else {
        console.error("tasks fetched failed:", data.message);
      }
      console.log("tasks:", tasks);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  }, [onLoadTasks, userEmail, tasks]);

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddTask = (task: Task) => {
    onAddTask(task);
    setShowForm(false);
  };

  const handleEditTask = async (task: Task) => {
    onEditTask(task);
    setEditTask(null);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/auth/logout", {
        method: "POST",
        credentials: "include", // ✅ Ensures cookies are sent with request
      });

      if (response.ok) {
        console.log("Logout successful");

        document.cookie =
          "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        onLogout(); // ✅ Update app state to reflect logged-out status
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Task Dashboard</h1>
          <div className="flex justify-between items-center space-x-2">
            <h2 className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-md border border-gray-600">
              {userEmail}
            </h2>
            <button
              onClick={() => handleLogout()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full mb-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Task
        </button>
        {showForm && (
          <TaskForm
            onAddTask={handleAddTask}
            onCancel={() => setShowForm(false)}
          />
        )}
        {editTask && (
          <TaskForm
            task={editTask}
            onEditTask={handleEditTask}
            onCancel={() => setEditTask(null)}
            reloadTasks={loadTasks} // ✅ Pass the function
          />
        )}
        <div className="space-y-4">
          {tasks.length !== 0 ? (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={() => setEditTask(task)}
                onDelete={() => onDeleteTask(task.id)}
                onToggleCompletion={() => onToggleTaskCompletion(task.id)}
                reloadTasks={loadTasks}
              />
            ))
          ) : (
            <div className="min-h-[30vh] flex flex-col justify-center items-center">
              <h2>No Tasks Exists</h2>
              <p>Create new task in your task list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
