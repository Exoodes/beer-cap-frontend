import { Button, Group, NumberInput, Stack, Text, Title } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  generateAllAugmentations,
  generateEmbeddings,
  generateIndex,
} from "../../api/admin";
import { notifySuccess } from "../../utils/notify";

/** The three steps that make caps findable by photo, run in this order. */
export function PipelineTab() {
  const { t } = useTranslation();
  const [variations, setVariations] = useState(5);
  const onDone = (result: { message: string }) => notifySuccess(result.message);
  const augment = useMutation({
    mutationFn: generateAllAugmentations,
    onSuccess: onDone,
  });
  const embed = useMutation({
    mutationFn: generateEmbeddings,
    onSuccess: onDone,
  });
  const index = useMutation({ mutationFn: generateIndex, onSuccess: onDone });

  return (
    <Stack gap="lg" maw={640}>
      <Text size="sm" c="dimmed">
        {t("admin.pipeline.intro")}
      </Text>

      <Stack gap="xs">
        <Title order={3}>{t("admin.pipeline.variationsTitle")}</Title>
        <Text size="sm">{t("admin.pipeline.variationsText")}</Text>
        <Group align="flex-end">
          <NumberInput
            label={t("admin.pipeline.variationsPerCap")}
            value={variations}
            onChange={(value) => setVariations(Number(value))}
            min={1}
            max={20}
            w={180}
          />
          <Button
            variant="default"
            loading={augment.isPending}
            onClick={() => augment.mutate(variations)}
          >
            {t("admin.pipeline.makeVariations")}
          </Button>
        </Group>
      </Stack>

      <Stack gap="xs">
        <Title order={3}>{t("admin.pipeline.describeTitle")}</Title>
        <Text size="sm">{t("admin.pipeline.describeText")}</Text>
        <Group>
          <Button
            variant="default"
            loading={embed.isPending}
            onClick={() => embed.mutate()}
          >
            {t("admin.pipeline.describe")}
          </Button>
        </Group>
      </Stack>

      <Stack gap="xs">
        <Title order={3}>{t("admin.pipeline.indexTitle")}</Title>
        <Text size="sm">{t("admin.pipeline.indexText")}</Text>
        <Group>
          <Button
            variant="default"
            loading={index.isPending}
            onClick={() => index.mutate()}
          >
            {t("admin.pipeline.rebuild")}
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
}
