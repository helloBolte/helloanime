"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";

export default function AuthModal() {
  const [isLogin, setIsLogin] = useState(true);

  // Field states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Toggle for password visibility
  const [showPassword, setShowPassword] = useState(false);
  // Toggle for confirm password visibility (only needed for sign-up)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error message state (optional)
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // In sign-up mode, ensure that password and confirm password match
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // If signing up, call the sign-up API endpoint
    if (!isLogin) {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (err) {
        console.error("No JSON returned", err);
      }

      if (!res.ok) {
        setError(data.message || "Error signing up");
        return;
      }
    }

    // For both login and sign-up, call NextAuth signIn
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
      callbackUrl: isLogin ? "/" : "/profile",
    });

    if (result?.error) {
      setError(result.error);
    } else if (result?.url) {
      window.location.href = result.url;
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button
          variant="secondary"
          className="bg-purple-600 text-white hover:bg-purple-700"
        >
          Login
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-md z-40" />
        <Dialog.Content
          className="z-50 fixed top-1/2 left-1/2 flex w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-3xl shadow-lg focus:outline-none"
        >
          <Dialog.Close asChild>
            <button className="absolute z-50 top-4 right-4 text-white hover:text-gray-200">
              <X size={24} />
            </button>
          </Dialog.Close>
          <Dialog.Title className="sr-only">
            {isLogin ? "Login Form" : "Sign Up Form"}
          </Dialog.Title>
          <div className="hidden md:block w-1/2 overflow-hidden rounded-l-3xl">
            <img
              src="/loginbg.png"
              alt="Auth side"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="w-full md:w-1/2 bg-black text-white p-8 md:rounded-r-3xl flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-2 text-center">
              {isLogin ? "Welcome Back!!" : "Create an Account"}
            </h2>
            {error && (
              <p className="text-center text-red-500 text-sm mb-2">{error}</p>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
              {/* Identifier Field */}
              <div className="flex flex-col gap-1">
                <label htmlFor="username" className="text-sm font-medium">
                  {isLogin ? "Username or Email" : "Choose a Username"}
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder={
                    isLogin
                      ? "Enter your username or email"
                      : "Enter a unique username"
                  }
                  className="bg-gray-800 text-white placeholder-gray-400 border-none focus:ring-2 focus:ring-purple-500"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              {/* Password Field */}
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="bg-gray-800 text-white placeholder-gray-400 border-none pr-10 focus:ring-2 focus:ring-purple-500"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-200"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {/* Confirm Password Field (only for Sign Up) */}
              {!isLogin && (
                <div className="flex flex-col gap-1">
                  <label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      className="bg-gray-800 text-white placeholder-gray-400 border-none pr-10 focus:ring-2 focus:ring-purple-500"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 text-gray-400 hover:text-gray-200"
                      onClick={() =>
                        setShowConfirmPassword((prev) => !prev)
                      }
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}
              <Button
                type="submit"
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              >
                {isLogin ? "Login" : "Sign Up"}
              </Button>
            </form>
            <div className="text-center mt-4">
              {isLogin ? (
                <p>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-purple-500 hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-purple-500 hover:underline"
                  >
                    Login
                  </button>
                </p>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
