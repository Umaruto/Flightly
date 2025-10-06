import { useState } from "react";

type Props = {
  mode: "login" | "signup";
  onSubmit: (data: {
    name?: string;
    email: string;
    password: string;
  }) => Promise<void>;
  error?: string | null;
};

export default function AuthForm({ mode, onSubmit, error }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, email, password });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "signup" && (
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Jane Doe"
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="••••••••"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        disabled={loading}
        className="w-full mt-2 bg-brand-600 text-white rounded-md py-2 hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? "Please wait…" : mode === "signup" ? "Sign Up" : "Login"}
      </button>
    </form>
  );
}
