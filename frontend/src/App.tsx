import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "./redux/store";
import { fetchAuthStatus } from "./redux/slices/auth.slice";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Auth from "./Screens/Auth";
import Register from "./Screens/Register";
import TaskDashboard from "./Screens/TaskDashboard";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./index.css";

export default function App() {
  const dispatch: AppDispatch = useDispatch();
  const { isAuthenticated, loggedUserEmail, loading } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    dispatch(fetchAuthStatus()); // Fetch auth state from backend
  }, [dispatch]);

  if (loading) {
    let index = 0;
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="space-y-6">
          <Skeleton height={60} width="100%" borderRadius={8} />
          <Skeleton height={30} width="100%" borderRadius={8} />
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
          element={isAuthenticated ? <Navigate to="/" /> : <Auth />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" /> : <Register />}
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <TaskDashboard userEmail={loggedUserEmail!} />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
      </Routes>
    </Router>
  );
}
