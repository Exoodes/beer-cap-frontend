// Mantine's styles first, so the app's own CSS wins where both apply.
import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "./styles/global.css";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { AdminProvider } from "./admin/AdminProvider";
import { cssVariablesResolver, theme } from "./theme";
import { notifyError } from "./utils/notify";

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
    <MantineProvider
      theme={theme}
      cssVariablesResolver={cssVariablesResolver}
      defaultColorScheme="light"
    >
      <Notifications position="top-right" />
      <QueryClientProvider client={queryClient}>
        <AdminProvider>
          <ModalsProvider>
            <App />
          </ModalsProvider>
        </AdminProvider>
      </QueryClientProvider>
    </MantineProvider>
  </React.StrictMode>,
);
