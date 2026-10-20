import { Button, Group, Stack, Text } from "@mantine/core";
import { IconArchive, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useTranslation } from "react-i18next";
import { createBackup, deleteBackup, getBackups } from "../../api/backups";
import { confirmDelete } from "../../utils/confirm";
import { notifySuccess } from "../../utils/notify";
import { formatFileSize } from "../../utils/prepareImage";
import { AdminList, AdminRow } from "./AdminList";

dayjs.extend(relativeTime);

export function BackupsTab() {
  const { t } = useTranslation();
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
      notifySuccess(t("admin.backups.created"));
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      notifySuccess(t("admin.backups.deleted"));
    },
  });

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <Text size="sm" c="dimmed" maw={520}>
          {t("admin.backups.intro")}
        </Text>
        <Button
          leftSection={<IconArchive size={16} />}
          loading={createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          {t("admin.backups.backUpNow")}
        </Button>
      </Group>

      {!isLoading && newestFirst.length === 0 ? (
        <Text c="dimmed">{t("admin.backups.none")}</Text>
      ) : (
        <AdminList>
          {newestFirst.map((backup) => {
            const created = dayjs(backup.created_at);
            return (
              <AdminRow
                key={backup.name}
                title={backup.name}
                details={`${backup.is_dir ? t("admin.backups.photos") : t("admin.backups.database")}, ${formatFileSize(backup.size)}`}
                meta={
                  <span title={created.format("D. M. YYYY HH:mm")}>
                    {created.fromNow()}
                  </span>
                }
                actions={[
                  {
                    label: t("admin.backups.deleteLabel", {
                      name: backup.name,
                    }),
                    short: t("common.delete"),
                    icon: <IconTrash size={18} />,
                    danger: true,
                    loading:
                      deleteMutation.isPending &&
                      deleteMutation.variables === backup.name,
                    onClick: () =>
                      confirmDelete({
                        title: t("admin.backups.deleteTitle", {
                          name: backup.name,
                        }),
                        message: t("admin.backups.deleteMessage"),
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
