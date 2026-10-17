// The app's look: a display board of green felt so the caps carry the
// colour, brass for actions, Big Shoulders Display for names and headings,
// Archivo for everything you read or type. Mantine runs in its dark scheme,
// with its "dark" greys replaced by the felt's greens.
import {
  Badge,
  Button,
  type CSSVariablesResolver,
  createTheme,
  Input,
  type MantineColorsTuple,
  Modal,
} from "@mantine/core";
import classes from "./styles/theme.module.css";

/** Brass. Shade 5 fills buttons (dark text). */
const brass: MantineColorsTuple = [
  "#FDF6E3",
  "#F9EAC2",
  "#F3D88E",
  "#EDC664",
  "#E6B84D",
  "#E0AE3E",
  "#C9952E",
  "#A97B22",
  "#8A6414",
  "#664806",
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

/**
 * The felt, light to dark, where Mantine expects its dark greys:
 * 0 text, 2 quiet text, 4 borders, 6 inputs and default buttons,
 * 7 the page, modals and menus.
 */
const dark: MantineColorsTuple = [
  "#EEF1E7",
  "#C9D5CC",
  "#A8BCAD",
  "#8DA393",
  "#3B5A47",
  "#2F4C3B",
  "#1C3427",
  "#24402F",
  "#172C21",
  "#122218",
];

const FONT = "Archivo, system-ui, -apple-system, 'Segoe UI', sans-serif";
const DISPLAY = "'Big Shoulders Display', 'Archivo Narrow', sans-serif";

export const theme = createTheme({
  primaryColor: "brass",
  primaryShade: 5,
  colors: { brass, bottle, dark },
  // Picks dark or light text from the fill: ink on brass, white on red.
  autoContrast: true,
  black: "#18261D",
  white: "#FFFFFF",
  fontFamily: FONT,
  headings: {
    fontFamily: DISPLAY,
    fontWeight: "800",
    sizes: {
      h1: { fontSize: "3rem", lineHeight: "0.95" },
      h2: { fontSize: "2rem", lineHeight: "1" },
      h3: { fontSize: "1.625rem", lineHeight: "1.05" },
      h4: { fontSize: "1.25rem", lineHeight: "1.1" },
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
  defaultRadius: "md",
  components: {
    Badge: Badge.extend({
      styles: { root: { textTransform: "none", letterSpacing: 0 } },
    }),
    // Pill buttons, like the chips and the search box.
    Button: Button.extend({ defaultProps: { radius: "xl" } }),
    // Inputs are sunk into the felt, like the sockets.
    Input: Input.extend({ classNames: { input: classes.input } }),
    Modal: Modal.extend({ classNames: { content: classes.modal } }),
  },
});

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {},
  dark: {
    "--mantine-color-body": "var(--felt)",
    "--mantine-color-text": "var(--foam)",
    "--mantine-color-dimmed": "var(--hop)",
    "--mantine-color-anchor": "var(--brass)",
    "--mantine-color-default": "var(--raised)",
    "--mantine-color-default-hover": "#2F4C3B",
    "--mantine-color-default-border": "var(--rule)",
    "--mantine-color-brass-text": "var(--brass)",
    "--mantine-color-brass-light-color": "var(--brass)",
    // Mantine's dark red text is too pink on green; a clearer red.
    "--mantine-color-red-text": "#FF8A7A",
    "--mantine-color-red-light-color": "#FF8A7A",
    "--mantine-color-red-filled": "var(--mantine-color-red-8)",
    "--mantine-color-red-filled-hover": "var(--mantine-color-red-9)",
    "--mantine-color-error": "#FF8A7A",
  },
});
