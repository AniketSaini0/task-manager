import { useState } from "react";
import { useNavigate } from "react-router-dom";
// below error : Module '"../types/index"' has no exported member 'LoginProps'
import { ValidationErrors } from "../types/index";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/auth.slice"; // Import Redux action

export default function Auth() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLoginForm, setIsLoginForm] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Invalid email address";

    if (!password) newErrors.password = "Password is required";
    // else if (password.length < 6)
    //   newErrors.password = "Password must be at least 6 characters";

    if (!isLoginForm && password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const url = isLoginForm
      ? "http://localhost:8001/api/auth/login"
      : "http://localhost:8001/api/auth/register";
    const body = JSON.stringify(
      isLoginForm ? { email, password } : { email, password, confirmPassword }
    );

    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await response.json();
      if (response.ok) {
        console.log(
          `${isLoginForm ? "Login" : "Registration"} successful`,
          data
        );

        const userEmail = data.info?.user?.email; // Ensure correct extraction
        if (userEmail) {
          dispatch(loginSuccess(userEmail)); // ✅ Update Redux state
        }

        if (isLoginForm) {
          dispatch(loginSuccess(userEmail)); // ✅ Update Redux
          navigate("/"); // Redirect to dashboard
        } else {
          console.log("Registration successful, now you can login");
          toggleForm(); // Switch to login form after successful registration
        }
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 relative overflow-hidden">
      <motion.div
        initial={{
          opacity: 0,
          x: isLoginForm ? -100 : 100,
          y: isLoginForm ? -100 : 100,
        }}
        animate={{ opacity: 0.4, x: 0, y: 0 }}
        exit={{
          opacity: 0,
          x: isLoginForm ? 100 : -100,
          y: isLoginForm ? 100 : -100,
        }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="absolute w-lg h-4/5 bg-gray-400 opacity-25 blur-3xl rounded-full"
        style={{
          top: isLoginForm ? "-20%" : "80%",
          left: isLoginForm ? "-30%" : "80%",
        }}
      ></motion.div>
      <div className="relative w-full max-w-md flex items-center justify-center min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={isLoginForm ? "login" : "register"}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute w-full bg-white/30 p-8 rounded-lg shadow-md"
          >
            <h2 className="text-3xl font-bold mb-6 text-center text-amber-600">
              {isLoginForm ? "Login" : "Register"}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
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
                  className="mt-1 block w-full px-3 py-2 border text-white border-gray-300 rounded-md"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
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
                  className="mt-1 block w-full px-3 py-2 border text-white border-gray-300 rounded-md"
                  required
                />
              </div>
              {!isLoginForm && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-white"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border text-white border-gray-300 rounded-md"
                    required
                  />
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                {isLoginForm ? "Login" : "Register"}
              </button>
              <div className="flex justify-center">
                {isLoginForm
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <span
                  className="text-orange-50 cursor-pointer ml-1"
                  onClick={toggleForm}
                >
                  {isLoginForm ? "Sign Up" : "Sign In"}
                </span>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
