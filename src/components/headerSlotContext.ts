import { createContext } from "react";

/**
 * The header's search slot. The collection page portals its search box
 * into it (see HeaderSlot), so the box shares the page's filter state.
 */
export const HeaderSlotContext = createContext<HTMLElement | null>(null);
