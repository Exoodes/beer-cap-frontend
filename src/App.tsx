import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminPage } from "./features/Admin/AdminPage";
import { AddCapPage } from "./features/Dashboard/AddCapPage";
import { CapDetailPage } from "./features/Dashboard/CapDetailPage";
import { DashboardPage } from "./features/Dashboard/DashboardPage";
import { MatcherPage } from "./features/Dashboard/MatcherPage";

function AuthCatcher({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const secret = params.get("admin_secret");

    if (secret) {
      localStorage.setItem("admin_token", secret);
      // Remove the secret from the URL bar immediately
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = !!localStorage.getItem("admin_token");
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthCatcher>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />

            <Route
              path="/add"
              element={
                <ProtectedRoute>
                  <AddCapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match"
              element={
                <ProtectedRoute>
                  <MatcherPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/cap/:id" element={<CapDetailPage />} />
        </Routes>
      </AuthCatcher>
    </BrowserRouter>
  );
}

export default App;
