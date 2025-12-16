import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AddCapPage } from "./features/Dashboard/AddCapPage";
import { CapDetailPage } from "./features/Dashboard/CapDetailPage";
import { DashboardPage } from "./features/Dashboard/DashboardPage";

const MatcherPlaceholder = () => <h1>🔍 Matcher - Find Similar Caps</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/add" element={<AddCapPage />} />
          <Route path="/match" element={<MatcherPlaceholder />} />
        </Route>
        <Route path="/cap/:id" element={<CapDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
