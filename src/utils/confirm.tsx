import { Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import i18n from "../i18n";

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
    labels: {
      confirm: i18n.t("common.delete"),
      cancel: i18n.t("common.cancel"),
    },
    confirmProps: { color: "red" },
    onConfirm,
  });
}
