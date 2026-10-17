import { Button, Group, Stack, Text } from "@mantine/core";
import { IconArchive, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { createBackup, deleteBackup, getBackups } from "../../api/backups";
import { confirmDelete } from "../../utils/confirm";
import { notifySuccess } from "../../utils/notify";
import { formatFileSize } from "../../utils/prepareImage";
import { AdminList, AdminRow } from "./AdminList";

dayjs.extend(relativeTime);

export function BackupsTab() {
  const queryClient = useQueryClient();
  const { data: backups = [], isLoading } = useQuery({
    queryKey: ["backups"],
    queryFn: getBackups,
  });
  const newestFirst = [...backups].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );

  const createMutation = useMutation({
    mutationFn: createBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      notifySuccess("Backup created.");
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      notifySuccess("Backup deleted.");
    },
  });

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <Text size="sm" c="dimmed" maw={520}>
          A backup copies the database and every cap photo to the server's disk:
          photos as a folder, the database as an SQL file.
        </Text>
        <Button
          leftSection={<IconArchive size={16} />}
          loading={createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          Back up now
        </Button>
      </Group>

      {!isLoading && newestFirst.length === 0 ? (
        <Text c="dimmed">No backups yet.</Text>
      ) : (
        <AdminList>
          {newestFirst.map((backup) => {
            const created = dayjs(backup.created_at);
            return (
              <AdminRow
                key={backup.name}
                title={backup.name}
                details={`${backup.is_dir ? "Photos" : "Database"}, ${formatFileSize(backup.size)}`}
                meta={
                  <span title={created.format("D. M. YYYY HH:mm")}>
                    {created.fromNow()}
                  </span>
                }
                actions={[
                  {
                    label: `Delete backup ${backup.name}`,
                    short: "Delete",
                    icon: <IconTrash size={18} />,
                    danger: true,
                    loading:
                      deleteMutation.isPending &&
                      deleteMutation.variables === backup.name,
                    onClick: () =>
                      confirmDelete({
                        title: `Delete the backup ${backup.name}?`,
                        message:
                          "Its files are removed from the server. This can't be undone.",
                        onConfirm: () => deleteMutation.mutate(backup.name),
                      }),
                  },
                ]}
              />
            );
          })}
        </AdminList>
      )}
    </Stack>
  );
}
