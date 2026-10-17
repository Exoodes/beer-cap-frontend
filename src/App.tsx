import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { useEffect } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAdmin } from "./admin/adminContext";
import { Layout } from "./components/Layout";
import { AddCapPage } from "./features/AddCap/AddCapPage";
import { AdminPage } from "./features/Admin/AdminPage";
import { CapDetailPage } from "./features/Dashboard/CapDetailPage";
import { DashboardPage } from "./features/Dashboard/DashboardPage";
import { MatcherPage } from "./features/Dashboard/MatcherPage";

function AuthCatcher({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { unlock } = useAdmin();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const secret = params.get("admin_secret");

    if (secret) {
      unlock(secret);
      // Remove the secret from the URL bar immediately
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, unlock]);

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAdmin();
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function NotFoundPage() {
  return (
    <Center h="50vh">
      <Stack align="center">
        <Title order={2}>Page not found</Title>
        <Text c="dimmed">This page doesn't exist.</Text>
        <Button component={Link} to="/">
          Back to the collection
        </Button>
      </Stack>
    </Center>
  );
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
            <Route path="/cap/:id" element={<CapDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthCatcher>
    </BrowserRouter>
  );
}

export default App;
