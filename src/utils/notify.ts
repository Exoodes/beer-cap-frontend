import { notifications } from "@mantine/notifications";
import { getErrorMessage } from "../api/client";

export function notifyError(error: unknown, title = "Something went wrong") {
  notifications.show({
    color: "red",
    title,
    message: getErrorMessage(error),
    autoClose: 8000,
  });
}

export function notifySuccess(message: string) {
  notifications.show({ color: "bottle", message, autoClose: 3000 });
}
