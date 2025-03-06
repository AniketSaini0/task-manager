import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginProps, ValidationErrors } from "../types/index";
export default function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    console.log("inside validate form");
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 1) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    console.log(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Handle form submission
      console.log("inside handleSubmit");

      try {
        const response = await fetch("http://localhost:8000/api/auth/login", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("Login successful", data);
          // Alternatively, for internal routing: navigate("/dashboard");

          // Store token in localStorage or state management
        } else {
          console.error("Login failed:", data.message);
        }
      } catch (error) {
        console.error("Error logging in:", error);
      }

      console.log("Form submitted successfully");
    }

    onLogin();
  };
  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   // Add authentication logic here
  //   onLogin();
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 relative">
      <div className="absolute -top-20 -left-30 w-lg h-4/5 bg-gray-400 opacity-25 blur-3xl rounded-full"></div>

      <div className="bg-white/30 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-amber-600">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border text-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 text-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login
          </button>

          <div className="flex justify-center">
            don't have an account?
            <span
              className="text-orange-50 cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
