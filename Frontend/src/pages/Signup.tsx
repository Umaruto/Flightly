import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
type Role = "USER" | "COMPANY_MANAGER" | "ADMIN";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import Container from "../components/Container";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("USER");

  const onSubmit = async ({
    name,
    email,
    password,
  }: {
    name?: string;
    email: string;
    password: string;
  }) => {
    try {
      setError(null);
      // create account
      await api.post("/api/auth/register", { name, email, password, role });
      // login to get token
      const { data } = await api.post("/api/auth/login", { email, password });
      const token = data?.access_token as string;
      if (!token) throw new Error("No token returned");
      const me = await api.get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      login(token, me.data);
      navigate("/dashboard");
    } catch (e: any) {
      setError(e.message || "Signup failed");
    }
  };
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center bg-gradient-to-br from-blue-50 to-blue-100">
      <Container className="w-full flex items-center justify-center">
        <div className="bg-white shadow rounded-xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-blue-700">
            Create your account
          </h2>
          <AuthForm mode="signup" onSubmit={onSubmit} error={error} />
          <Select
            label="Role (mock)"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="mt-3"
          >
            <option value="USER">User</option>
            <option value="COMPANY_MANAGER">Company Manager</option>
          </Select>
          <p className="mt-4 text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-700 hover:underline">
              Login
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
