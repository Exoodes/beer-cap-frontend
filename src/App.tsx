import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminPage } from "./features/Admin/AdminPage";
import { AddCapPage } from "./features/Dashboard/AddCapPage";
import { CapDetailPage } from "./features/Dashboard/CapDetailPage";
import { DashboardPage } from "./features/Dashboard/DashboardPage";
import { MatcherPage } from "./features/Dashboard/MatcherPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/add" element={<AddCapPage />} />
          <Route path="/match" element={<MatcherPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="/cap/:id" element={<CapDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
