import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import { login as loginService } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await loginService(formData);

      // Save admin user and token
      login(response.data, response.token);

      // Redirect to ADMIN dashboard
      navigate("/dashboard");

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="bg-white shadow-xl rounded-xl w-full max-w-md p-8">

        <h1 className="text-3xl font-bold text-center">
          YIZ-AMS
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Administrator Login
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full border rounded-lg p-3"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="relative">

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full border rounded-lg p-3 pr-12"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              className="absolute right-4 top-4"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-blue-600
              text-white
              rounded-lg
              p-3
              hover:bg-blue-700
              disabled:bg-blue-300
              transition
            "
          >
            {loading ? "Signing In..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
};

export default Login;