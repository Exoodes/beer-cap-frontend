import { type ReactNode, useContext } from "react";
import { createPortal } from "react-dom";
import { HeaderSlotContext } from "./headerSlotContext";

/** Renders its children in the header, next to the app's name. */
export function HeaderSlot({ children }: { children: ReactNode }) {
  const slot = useContext(HeaderSlotContext);
  return slot ? createPortal(children, slot) : null;
}
