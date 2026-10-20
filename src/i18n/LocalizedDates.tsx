import { DatesProvider } from "@mantine/dates";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { currentLanguage } from ".";

/** Date pickers in the UI's language (month and day names). */
export function LocalizedDates({ children }: { children: ReactNode }) {
  // Re-renders on a language switch.
  useTranslation();
  return (
    <DatesProvider settings={{ locale: currentLanguage() }}>
      {children}
    </DatesProvider>
  );
}
