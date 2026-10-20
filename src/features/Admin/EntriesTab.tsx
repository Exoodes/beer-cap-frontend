import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import {
  IconArrowMerge,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Choice } from "../../components/CreatablePicker";
import { confirmDelete } from "../../utils/confirm";
import { cleanName } from "../../utils/names";
import { notifySuccess } from "../../utils/notify";
import { collator, matchesWords } from "../../utils/search";
import { AdminList, AdminRow } from "./AdminList";
import { MergeModal } from "./MergeModal";

export interface Entry {
  id: number;
  name: string;
  description?: string | null;
  beer_count?: number | null;
}

interface EntriesTabProps<T extends Entry> {
  /** Picks the wording. */
  kind: "brand" | "country";
  entries: T[];
  /** Query keys to refresh after a change. */
  invalidates: string[];
  create: (name: string, description: string | null) => Promise<unknown>;
  remove: (id: number) => Promise<void>;
  merge: (id: number, intoId: number) => Promise<void>;
  /** Countries have an optional description. */
  withDescription?: boolean;
  renderEdit: (entry: T, done: () => void) => ReactNode;
  renderPicker: (
    others: T[],
    value: Choice | null,
    onChange: (choice: Choice) => void,
  ) => ReactNode;
}

/** Brands or countries: add, rename, merge duplicates, delete unused ones. */
export function EntriesTab<T extends Entry>({
  kind,
  entries,
  invalidates,
  create,
  remove,
  merge,
  withDescription,
  renderEdit,
  renderPicker,
}: EntriesTabProps<T>) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const refresh = () => {
    for (const key of invalidates) {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
  };

  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editing, setEditing] = useState<T | null>(null);
  const [merging, setMerging] = useState<T | null>(null);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => collator.compare(a.name, b.name)),
    [entries],
  );
  const shown = sorted.filter((entry) => matchesWords(entry.name, search));

  const createMutation = useMutation({
    mutationFn: () => create(cleanName(newName), newDescription.trim() || null),
    onSuccess: () => {
      refresh();
      notifySuccess(t("admin.added", { name: cleanName(newName) }));
      setNewName("");
      setNewDescription("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: remove,
    onSuccess: () => {
      refresh();
      notifySuccess(t(`admin.${kind}.deleted`));
    },
  });

  const nameOf = (id: number) => entries.find((e) => e.id === id)?.name ?? "";

  return (
    <Stack gap="md">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (cleanName(newName)) createMutation.mutate();
        }}
      >
        <Group align="flex-end" gap="sm">
          <TextInput
            label={t(`admin.${kind}.new`)}
            placeholder={t("common.name")}
            value={newName}
            onChange={(event) => setNewName(event.currentTarget.value)}
            style={{ flex: "1 1 200px" }}
          />
          {withDescription && (
            <TextInput
              label={t("admin.descriptionOptional")}
              value={newDescription}
              onChange={(event) => setNewDescription(event.currentTarget.value)}
              style={{ flex: "2 1 240px" }}
            />
          )}
          <Button
            type="submit"
            variant="default"
            leftSection={<IconPlus size={16} />}
            loading={createMutation.isPending}
            disabled={!cleanName(newName)}
          >
            {t(`admin.${kind}.add`)}
          </Button>
        </Group>
      </form>

      {entries.length > 12 && (
        <TextInput
          aria-label={t(`admin.${kind}.searchLabel`)}
          placeholder={t("common.search")}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          maw={420}
        />
      )}

      {shown.length === 0 ? (
        <Text c="dimmed">
          {entries.length ? t("admin.noMatch", { search }) : t("admin.none")}
        </Text>
      ) : (
        <AdminList>
          {shown.map((entry) => {
            const count = entry.beer_count ?? 0;
            return (
              <AdminRow
                key={entry.id}
                title={entry.name}
                details={entry.description}
                meta={t("common.beers", { count })}
                actions={[
                  {
                    label: t("admin.editNamed", { name: entry.name }),
                    short: t("common.edit"),
                    icon: <IconPencil size={18} />,
                    onClick: () => setEditing(entry),
                  },
                  {
                    label: t(`admin.${kind}.mergeLabel`, { name: entry.name }),
                    short: t(`admin.${kind}.mergeShort`),
                    icon: <IconArrowMerge size={18} />,
                    onClick: () => setMerging(entry),
                  },
                  {
                    label: t("admin.deleteNamed", { name: entry.name }),
                    short: t("common.delete"),
                    icon: <IconTrash size={18} />,
                    danger: true,
                    disabledReason:
                      count > 0
                        ? t(`admin.${kind}.usedBy`, { count })
                        : undefined,
                    loading:
                      deleteMutation.isPending &&
                      deleteMutation.variables === entry.id,
                    onClick: () =>
                      confirmDelete({
                        title: t("admin.deleteQuestion", { name: entry.name }),
                        message: t("common.cantUndo"),
                        onConfirm: () => deleteMutation.mutate(entry.id),
                      }),
                  },
                ]}
              />
            );
          })}
        </AdminList>
      )}

      <Modal
        opened={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? t("admin.editNamed", { name: editing.name }) : ""}
      >
        {editing && renderEdit(editing, () => setEditing(null))}
      </Modal>

      <MergeModal
        source={merging}
        onClose={() => setMerging(null)}
        title={
          merging ? t(`admin.${kind}.mergeLabel`, { name: merging.name }) : ""
        }
        explanation={
          merging &&
          t(`admin.${kind}.mergeExplanation`, {
            count: merging.beer_count ?? 0,
            name: merging.name,
          })
        }
        renderPicker={(value, onChange) =>
          renderPicker(
            entries.filter((entry) => entry.id !== merging?.id),
            value,
            onChange,
          )
        }
        nameOf={nameOf}
        merge={merge}
      />
    </Stack>
  );
}
