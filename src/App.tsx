import { Container, SimpleGrid } from "@mantine/core";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BeerCapCard } from "./components/BeerCapCard";
import { ImageDropzone } from "./components/ImageDropzone";
import { Layout } from "./components/Layout";
import type { BeerCap } from "./types";

// 1. Create fake data for testing
const FAKE_CAP: BeerCap = {
  id: 1,
  variant_name: "Gold Edition",
  collected_date: "2023-01-01",
  presigned_url: "https://placehold.co/400x400/orange/white?text=Beer+Cap",
  beer: {
    id: 101,
    name: "Summer Ale",
    rating: 8,
    country: { id: 1, name: "Germany", description: null },
  },
};

// 2. Update the Placeholder Component
const DashboardPlaceholder = () => (
  <Container py="xl">
    <h1>🏠 Dashboard</h1>
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
      <BeerCapCard cap={FAKE_CAP} />
      <BeerCapCard
        cap={{
          ...FAKE_CAP,
          id: 2,
          variant_name: null,
          beer: { ...FAKE_CAP.beer, name: "Dark Stout", rating: 9 },
        }}
      />
    </SimpleGrid>
  </Container>
);

const AddCapPlaceholder = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <Container py="xl">
      <h1>➕ Add New Cap</h1>
      <ImageDropzone
        image={file}
        onDrop={(f) => setFile(f)}
        onClear={() => setFile(null)}
      />
    </Container>
  );
};

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
