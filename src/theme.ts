// The app's look: a quiet aluminium-grey tray so the caps carry the colour,
// one lager-amber accent for actions, and Archivo (condensed for headings).
import {
  Badge,
  type CSSVariablesResolver,
  createTheme,
  type MantineColorsTuple,
} from "@mantine/core";

/** Lager amber. Shade 5 fills buttons (dark text); 8 is for text on light. */
const lager: MantineColorsTuple = [
  "#FFF8E6",
  "#FCEFC9",
  "#F7DE95",
  "#F1CB5D",
  "#E8B53A",
  "#DCA126",
  "#CF9419",
  "#A9710C",
  "#885A0A",
  "#664306",
];

/** Bottle green, for confirmations ("Saved"). */
const bottle: MantineColorsTuple = [
  "#E9F5EE",
  "#CDE8D7",
  "#A3D4B5",
  "#74BC90",
  "#4FA672",
  "#3A8B5C",
  "#2E6B47",
  "#25583A",
  "#1C452E",
  "#133321",
];

const FONT = "Archivo, system-ui, -apple-system, 'Segoe UI', sans-serif";

export const theme = createTheme({
  primaryColor: "lager",
  primaryShade: 5,
  colors: { lager, bottle },
  // Picks dark or light text from the fill: ink on amber, white on green.
  autoContrast: true,
  black: "#24313B",
  white: "#FFFFFF",
  fontFamily: FONT,
  headings: {
    fontFamily: FONT,
    fontWeight: "700",
    sizes: {
      h1: { fontSize: "2.5rem", lineHeight: "1.1" },
      h2: { fontSize: "1.75rem", lineHeight: "1.15" },
      h3: { fontSize: "1.25rem", lineHeight: "1.2" },
      h4: { fontSize: "1rem", lineHeight: "1.3" },
    },
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
  },
  lineHeights: { md: "1.45" },
  defaultRadius: "sm",
  components: {
    Badge: Badge.extend({
      styles: { root: { textTransform: "none", letterSpacing: 0 } },
    }),
  },
});

/**
 * Colours Mantine derives from the primary colour, adjusted so text stays
 * readable: amber text on white is too faint, so text uses the deep shade.
 * Mantine's "body" colour stays white (modals, menus, the header use it);
 * only the page itself is the grey tray, set in global.css.
 */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    "--mantine-color-text": "var(--ink)",
    "--mantine-color-dimmed": "var(--quiet)",
    "--mantine-color-anchor": "var(--mantine-color-lager-8)",
    "--mantine-color-lager-text": "var(--mantine-color-lager-8)",
    "--mantine-color-lager-light": "var(--mantine-color-lager-1)",
    "--mantine-color-lager-light-hover": "var(--mantine-color-lager-2)",
    "--mantine-color-lager-light-color": "var(--mantine-color-lager-9)",
    "--mantine-color-lager-outline": "var(--mantine-color-lager-8)",
    // Mantine's red is about 3:1 on white; one shade darker for text and fills.
    "--mantine-color-red-text": "var(--mantine-color-red-8)",
    "--mantine-color-red-light-color": "var(--mantine-color-red-8)",
    "--mantine-color-red-filled": "var(--mantine-color-red-8)",
    "--mantine-color-red-filled-hover": "var(--mantine-color-red-9)",
  },
  dark: {},
});
