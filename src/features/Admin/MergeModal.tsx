import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Choice } from "../../components/CreatablePicker";
import { notifySuccess } from "../../utils/notify";

interface MergeModalProps {
  /** The duplicate being merged away; null closes the modal. */
  source: { id: number; name: string } | null;
  onClose: () => void;
  /** What happens, in plain words, e.g. "Its 2 caps move to the beer you pick…" */
  explanation: ReactNode;
  /** A picker of the other entries (existing ones only). */
  renderPicker: (
    value: Choice | null,
    onChange: (choice: Choice) => void,
  ) => ReactNode;
  /** "Merge Bernard into another beer". */
  title: string;
  nameOf: (id: number) => string;
  merge: (id: number, intoId: number) => Promise<void>;
}

/** Folds a duplicate beer, brand or country into the one to keep. */
export function MergeModal({
  source,
  onClose,
  title,
  ...props
}: MergeModalProps) {
  return (
    <Modal opened={source !== null} onClose={onClose} title={title}>
      {/* Mounted per opening, so the choice starts empty. */}
      {source && <MergeForm source={source} onClose={onClose} {...props} />}
    </Modal>
  );
}

function MergeForm({
  source,
  onClose,
  explanation,
  renderPicker,
  nameOf,
  merge,
}: Omit<MergeModalProps, "source" | "title"> & {
  source: { id: number; name: string };
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [target, setTarget] = useState<Choice | null>(null);
  const targetId = target && "id" in target ? target.id : null;

  const mutation = useMutation({
    mutationFn: (intoId: number) => merge(source.id, intoId),
    onSuccess: (_, intoId) => {
      for (const key of ["beers", "brands", "countries", "beerCaps"]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      notifySuccess(
        t("admin.merged", { source: source.name, target: nameOf(intoId) }),
      );
      onClose();
    },
  });

  return (
    <Stack gap="md">
      <Text size="sm">{explanation}</Text>
      {renderPicker(target, setTarget)}
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button
          disabled={targetId === null}
          loading={mutation.isPending}
          onClick={() => targetId !== null && mutation.mutate(targetId)}
        >
          {targetId === null
            ? t("admin.merge")
            : t("admin.mergeInto", { name: nameOf(targetId) })}
        </Button>
      </Group>
    </Stack>
  );
}
