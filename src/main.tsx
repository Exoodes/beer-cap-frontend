import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { notifyError } from "./utils/notify";
import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

// Every failed mutation shows the API's error message, so individual
// mutations don't need their own onError.
const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => notifyError(error),
  }),
});

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <MantineProvider>
      <Notifications position="top-right" />
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </MantineProvider>
  </React.StrictMode>,
);
