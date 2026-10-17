import { Text } from "@mantine/core";
import { modals } from "@mantine/modals";

interface ConfirmDeleteOptions {
  /** A question naming the thing: "Delete Bernard 12°?" */
  title: string;
  /** What else goes with it, in plain words. */
  message: string;
  onConfirm: () => void;
}

/** Asks before deleting; the red button repeats what will happen. */
export function confirmDelete({
  title,
  message,
  onConfirm,
}: ConfirmDeleteOptions) {
  modals.openConfirmModal({
    title,
    children: <Text size="sm">{message}</Text>,
    labels: { confirm: "Delete", cancel: "Cancel" },
    confirmProps: { color: "red" },
    onConfirm,
  });
}
