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
  /** "brand" or "country", for the wording. */
  noun: string;
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

const beersText = (count: number) =>
  count === 1 ? "1 beer" : `${count} beers`;

/** Brands or countries: add, rename, merge duplicates, delete unused ones. */
export function EntriesTab<T extends Entry>({
  noun,
  entries,
  invalidates,
  create,
  remove,
  merge,
  withDescription,
  renderEdit,
  renderPicker,
}: EntriesTabProps<T>) {
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
      notifySuccess(`Added ${cleanName(newName)}.`);
      setNewName("");
      setNewDescription("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: remove,
    onSuccess: () => {
      refresh();
      notifySuccess(`The ${noun} was deleted.`);
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
            label={`New ${noun}`}
            placeholder="Name"
            value={newName}
            onChange={(event) => setNewName(event.currentTarget.value)}
            style={{ flex: "1 1 200px" }}
          />
          {withDescription && (
            <TextInput
              label="Description (optional)"
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
            Add {noun}
          </Button>
        </Group>
      </form>

      {entries.length > 12 && (
        <TextInput
          aria-label={`Search ${noun} names`}
          placeholder="Search"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          maw={420}
        />
      )}

      {shown.length === 0 ? (
        <Text c="dimmed">
          {entries.length ? `Nothing matches “${search}”.` : "None yet."}
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
                meta={beersText(count)}
                actions={[
                  {
                    label: `Edit ${entry.name}`,
                    short: "Edit",
                    icon: <IconPencil size={18} />,
                    onClick: () => setEditing(entry),
                  },
                  {
                    label: `Merge ${entry.name} into another ${noun}`,
                    short: `Merge into another ${noun}`,
                    icon: <IconArrowMerge size={18} />,
                    onClick: () => setMerging(entry),
                  },
                  {
                    label: `Delete ${entry.name}`,
                    short: "Delete",
                    icon: <IconTrash size={18} />,
                    danger: true,
                    disabledReason:
                      count > 0
                        ? `Used by ${beersText(count)}. Merge it into another ${noun} instead.`
                        : undefined,
                    loading:
                      deleteMutation.isPending &&
                      deleteMutation.variables === entry.id,
                    onClick: () =>
                      confirmDelete({
                        title: `Delete ${entry.name}?`,
                        message: "This can't be undone.",
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
        title={editing ? `Edit ${editing.name}` : ""}
      >
        {editing && renderEdit(editing, () => setEditing(null))}
      </Modal>

      <MergeModal
        source={merging}
        onClose={() => setMerging(null)}
        explanation={
          merging &&
          `Use this for a duplicate. ${
            (merging.beer_count ?? 0) === 1
              ? "Its beer moves"
              : `Its ${beersText(merging.beer_count ?? 0)} move`
          } to the ${noun} you pick, then ${merging.name} is deleted.${
            noun === "brand"
              ? " A beer the other brand already has is joined with it, so their caps end up together."
              : ""
          }`
        }
        renderPicker={(value, onChange) =>
          renderPicker(
            entries.filter((entry) => entry.id !== merging?.id),
            value,
            onChange,
          )
        }
        noun={noun}
        nameOf={nameOf}
        merge={merge}
      />
    </Stack>
  );
}
