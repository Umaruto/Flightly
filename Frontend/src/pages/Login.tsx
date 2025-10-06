import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import Container from "../components/Container";
import Button from "../components/ui/Button";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      setError(null);
      const { data } = await api.post("/api/auth/login", {
        email: email.trim(),
        password,
      });
      const token = data?.access_token as string;
      if (!token) throw new Error("No token returned");
      // fetch current user profile
      const me = await api.get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      login(token, me.data);
      navigate("/dashboard");
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : e?.message || "Login failed"
      );
    }
  };
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center bg-gradient-to-br from-blue-50 to-blue-100">
      <Container className="w-full flex items-center justify-center">
        <div className="bg-white shadow rounded-xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-blue-700">Login</h2>
          <AuthForm mode="login" onSubmit={onSubmit} error={error} />
          <p className="mt-4 text-sm text-slate-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-700 hover:underline">
              Sign up
            </Link>
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
