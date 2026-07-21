import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!username.trim() || !password.trim()) return;
    setError("");
    setLoading(true);

    try {
      const result =
        mode === "login"
          ? await login(username, password)
          : await register(username, password);

      if (result.error) setError(result.error);
    } catch (error) {
      console.error("Auth submission failed:", error);
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-zinc-950 rounded-2xl">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <div className="text-center mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">
            #
          </div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {mode === "login"
              ? "Sign in to continue"
              : "Pick a username and password"}
          </p>
        </div>

        <input
          className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600"
          placeholder="Username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoFocus
        />

        <input
          type="password"
          className="bg-zinc-800 text-zinc-100 border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        {error && <p className="text-rose-400 text-xs px-1">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading || !username.trim() || !password.trim()}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 active:scale-95 transition-all text-white rounded-xl px-4 py-3 text-sm font-medium"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </button>

        <p>
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            className="text-violet-400 hover:text-violet-300 ml-1 transition-colors"
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
