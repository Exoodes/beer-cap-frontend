import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";

const DashboardPlaceholder = () => <h1>🏠 Dashboard - Your Caps</h1>;
const AddCapPlaceholder = () => <h1>➕ Add New Cap Page</h1>;
const MatcherPlaceholder = () => <h1>🔍 Matcher - Find Similar Caps</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPlaceholder />} />
          <Route path="/add" element={<AddCapPlaceholder />} />
          <Route path="/match" element={<MatcherPlaceholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;