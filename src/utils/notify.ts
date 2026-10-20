import { notifications } from "@mantine/notifications";
import { getErrorMessage } from "../api/client";
import i18n from "../i18n";

export function notifyError(error: unknown, title?: string) {
  notifications.show({
    color: "red",
    title: title ?? i18n.t("errors.generic"),
    message: getErrorMessage(error),
    autoClose: 8000,
  });
}

export function notifySuccess(message: string) {
  notifications.show({ color: "bottle", message, autoClose: 3000 });
}
