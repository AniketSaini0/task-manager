import { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// import Login from "./Screens/Login";
import Auth from "./Screens/Auth";
import Register from "./Screens/Register";
import TaskDashboard from "./Screens/TaskDashboard";
import { Task } from "./types/index";
import "./index.css";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loggedUserEmail, setLoggedUserEmail] = useState("");

  const handleLogin = (email: string) => {
    setLoggedUserEmail(email);
    setIsAuthenticated(true);
  };
  const handleLogout = () => setIsAuthenticated(false);

  const loadTasks = (tasks: Task[]) => setTasks(tasks);

  const addTask = (task: Task) => setTasks([...tasks, task]);
  const editTask = (updatedTask: Task) =>
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  const deleteTask = (taskId: string) =>
    setTasks(tasks.filter((task) => task.id !== taskId));
  const toggleTaskCompletion = (taskId: string) =>
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.isCompleted } : task
      )
    );

  const [loading, setLoading] = useState(true); // ✅ New state to track loading

  const checkAuthentication = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/current-user",
        {
          method: "GET",
          credentials: "include", // ✅ Sends HTTP-only cookies
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("User session restored:", data);
        setLoggedUserEmail(await data?.data?.email);
        setIsAuthenticated(true);
      } else {
        console.log("User not authenticated");
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false); // ✅ Stop loading after auth check completes
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  // ✅ Show loader while checking authentication
  if (loading) {
    let index = 0;
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="space-y-6">
          <Skeleton height={60} width="100%" borderRadius={8} />
          <Skeleton height={30} width="100%" borderRadius={8} />
          {/* Skeleton for Multiple Rows */}
          <div className="space-y-4">
            <Skeleton
              key={index++}
              count={5}
              height={80}
              width="100%"
              borderRadius={8}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/auth"
          element={
            isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <Auth onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" /> : <Register />}
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <TaskDashboard
                tasks={tasks}
                onLoadTasks={loadTasks}
                onAddTask={addTask}
                onEditTask={editTask}
                onDeleteTask={deleteTask}
                onToggleTaskCompletion={toggleTaskCompletion}
                onLogout={handleLogout}
                userEmail={loggedUserEmail}
              />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
      </Routes>
    </Router>
  );
}
