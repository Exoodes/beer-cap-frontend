import { Button, Group, NumberInput, Stack, Text, Title } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  generateAllAugmentations,
  generateEmbeddings,
  generateIndex,
} from "../../api/admin";
import { notifySuccess } from "../../utils/notify";

/** The three steps that make caps findable by photo, run in this order. */
export function PipelineTab() {
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
        Run these after adding caps, in order. Each step works on the whole
        collection and can take several minutes on the server.
      </Text>

      <Stack gap="xs">
        <Title order={3}>1. Make variations</Title>
        <Text size="sm">
          Creates rotated and re-lit copies of every cap photo.
        </Text>
        <Group align="flex-end">
          <NumberInput
            label="Variations per cap"
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
            Make variations
          </Button>
        </Group>
      </Stack>

      <Stack gap="xs">
        <Title order={3}>2. Describe the photos</Title>
        <Text size="sm">
          Turns every variation into numbers the search can compare.
        </Text>
        <Group>
          <Button
            variant="default"
            loading={embed.isPending}
            onClick={() => embed.mutate()}
          >
            Describe photos
          </Button>
        </Group>
      </Stack>

      <Stack gap="xs">
        <Title order={3}>3. Rebuild the search index</Title>
        <Text size="sm">Makes the Matcher use the new descriptions.</Text>
        <Group>
          <Button
            variant="default"
            loading={index.isPending}
            onClick={() => index.mutate()}
          >
            Rebuild index
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
}
