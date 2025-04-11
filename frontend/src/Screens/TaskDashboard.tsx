import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { addTask, editTask } from "../redux/slices/task.slice";
import { logout } from "../redux/slices/auth.slice";
import TaskForm from "../Components/TaskForm";
import TaskItem from "../Components/TaskItem";
import { Task } from "../types";

export default function TaskDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);
  const [showForm, setShowForm] = useState(false); // this state decides if the TaskForm should be visible or not
  const [editTaskData, setEditTaskData] = useState<Task | null>(null); // this takes the data
  const { loggedUserEmail } = useSelector((state: RootState) => state.auth);

  // Handle Add Task
  const handleAddTask = (task: Task) => {
    dispatch(addTask(task));
    setShowForm(false);
  };
  // Handle Edit Task
  const handleEditTask = (task: Task) => {
    dispatch(editTask(task));
    setEditTaskData(null);
  };

  // Handle Logout
  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Task Dashboard</h1>
          <div className="flex justify-between items-center space-x-2">
            <h2 className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-md border border-gray-600">
              {loggedUserEmail}
            </h2>
            <button
              onClick={handleLogout}
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
            onSubmit={handleAddTask}
            onCancel={() => setShowForm(false)}
          />
        )}
        {editTaskData && (
          <TaskForm
            task={editTaskData}
            onSubmit={handleEditTask}
            onCancel={() => setEditTaskData(null)}
          />
        )}
        <div className="space-y-4">
          {loading ? (
            <p className="flex justify-center mt-10">Loading tasks...</p>
          ) : tasks.length !== 0 ? (
            tasks.map((task) => <TaskItem key={task._id} task={task} />)
          ) : (
            <div className="min-h-[30vh] flex flex-col justify-center items-center">
              <h2>No Tasks Exist</h2>
              <p>Create a new task in your task list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
