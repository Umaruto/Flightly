import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import { useState } from "react";

export default function Header() {
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const onLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <header className="w-full bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-700">
          ✈️ Flightly
        </Link>
        <button
          className="md:hidden px-3 py-1.5 rounded border text-sm"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          Menu
        </button>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link to="/" className="text-slate-600 hover:text-blue-700">
            Home
          </Link>
          {token ? (
            <>
              <Link
                to="/dashboard"
                className="text-slate-600 hover:text-blue-700"
              >
                Dashboard
              </Link>
              {user?.role === "COMPANY_MANAGER" && (
                <div className="flex items-center gap-4">
                  <Link
                    to="/company/flights"
                    className="text-slate-600 hover:text-blue-700"
                  >
                    Company
                  </Link>
                  <Link
                    to="/company/stats"
                    className="text-slate-600 hover:text-blue-700"
                  >
                    Stats
                  </Link>
                </div>
              )}
              {user?.role === "ADMIN" && (
                <div className="flex items-center gap-4">
                  <Link
                    to="/admin/stats"
                    className="text-slate-600 hover:text-slate-900"
                  >
                    Stats
                  </Link>
                  <Link
                    to="/admin/users"
                    className="text-slate-600 hover:text-slate-900"
                  >
                    Admin Users
                  </Link>
                  <Link
                    to="/admin/companies"
                    className="text-slate-600 hover:text-slate-900"
                  >
                    Companies
                  </Link>
                  <Link
                    to="/admin/content"
                    className="text-slate-600 hover:text-slate-900"
                  >
                    Content
                  </Link>
                </div>
              )}
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded bg-slate-800 text-white hover:bg-slate-900"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1.5 rounded border border-blue-600 text-blue-700 hover:bg-blue-50"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white/95">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3 text-sm">
            <Link
              to="/"
              className="text-slate-600 hover:text-blue-700"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            {token ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-600 hover:text-blue-700"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                {user?.role === "COMPANY_MANAGER" && (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/company/flights"
                      className="text-slate-600 hover:text-blue-700"
                      onClick={() => setOpen(false)}
                    >
                      Company
                    </Link>
                    <Link
                      to="/company/stats"
                      className="text-slate-600 hover:text-blue-700"
                      onClick={() => setOpen(false)}
                    >
                      Stats
                    </Link>
                  </div>
                )}
                {user?.role === "ADMIN" && (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/admin/stats"
                      className="text-slate-600 hover:text-slate-900"
                      onClick={() => setOpen(false)}
                    >
                      Stats
                    </Link>
                    <Link
                      to="/admin/users"
                      className="text-slate-600 hover:text-slate-900"
                      onClick={() => setOpen(false)}
                    >
                      Admin Users
                    </Link>
                    <Link
                      to="/admin/companies"
                      className="text-slate-600 hover:text-slate-900"
                      onClick={() => setOpen(false)}
                    >
                      Companies
                    </Link>
                    <Link
                      to="/admin/content"
                      className="text-slate-600 hover:text-slate-900"
                      onClick={() => setOpen(false)}
                    >
                      Content
                    </Link>
                  </div>
                )}
                <button
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                  className="px-3 py-1.5 rounded bg-slate-800 text-white hover:bg-slate-900 w-fit"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 rounded border border-blue-600 text-blue-700 hover:bg-blue-50"
                  onClick={() => setOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
