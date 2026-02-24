import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../apiclient/apiclient";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // ✅ Use apiClient (baseURL already configured)
      const res = await apiClient.post("/login", {
        email,
        password,
      });

      // ✅ Save auth data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ Redirect to dashboard for all devices
      navigate("/dashboard");

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-[380px]">

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#ff4d4d] text-center">
          Restro Admin
        </h1>
        <p className="text-gray-500 text-center mt-1 mb-6">
          Sign in to continue
        </p>

        {/* Error Message */}
        {error && (
          <p className="bg-red-100 text-red-600 p-2 rounded-lg mb-4 text-center">
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            placeholder="admin@resto.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#ff4d4d]"
            required
          />

          <label className="block mt-4 mb-1 font-medium">Password</label>
          <input
            type="password"
            placeholder="•••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#ff4d4d]"
            required
          />

          <button
            type="submit"
            className="w-full bg-[#ff4d4d] hover:bg-[#e63939] text-white font-semibold rounded-lg p-3 mt-6 transition"
          >
            Login
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
