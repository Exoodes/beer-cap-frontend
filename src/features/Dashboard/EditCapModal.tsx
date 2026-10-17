// src/features/Dashboard/EditCapModal.tsx

import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBeer, updateCap } from "../../api/beerCaps";
import type { BeerCap } from "../../types";
import { notifySuccess } from "../../utils/notify";

interface EditCapModalProps {
  opened: boolean;
  close: () => void;
  cap: BeerCap;
}

export function EditCapModal({ opened, close, cap }: EditCapModalProps) {
  return (
    <Modal opened={opened} onClose={close} title="Edit Cap Details" centered>
      {/* Mounted per opening, so the form always starts from the current cap. */}
      {opened && <EditCapForm cap={cap} close={close} />}
    </Modal>
  );
}

function EditCapForm({ cap, close }: { cap: BeerCap; close: () => void }) {
  const queryClient = useQueryClient();
  const currentRating = cap.beer.rating ?? 0;

  const form = useForm({
    initialValues: {
      variant_name: cap.variant_name ?? "",
      rating: currentRating,
      // Mantine 8 date inputs use "YYYY-MM-DD" strings, like the API.
      collected_date: cap.collected_date ?? null,
    },
    validate: {
      rating: (value) =>
        value < 0 || value > 10 ? "Rating must be between 0-10" : null,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: typeof form.values) => {
      if (values.rating !== currentRating) {
        await updateBeer(cap.beer.id, { rating: values.rating });
      }
      // Empty fields are sent as null so clearing them actually saves.
      await updateCap(cap.id, {
        variant_name: values.variant_name.trim() || null,
        collected_date: values.collected_date || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beerCap", cap.id] });
      queryClient.invalidateQueries({ queryKey: ["beerCaps"] });
      notifySuccess("Cap updated.");
      close();
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
      <Stack>
        <Text size="xs" c="dimmed">
          Editing Cap #{cap.id} (Beer #{cap.beer.id})
        </Text>

        <TextInput
          label="Variant Name"
          placeholder="e.g. Winter Edition"
          {...form.getInputProps("variant_name")}
        />

        <NumberInput
          label="Beer Rating (0-10)"
          description="Updates rating for ALL caps of this beer"
          min={0}
          max={10}
          {...form.getInputProps("rating")}
        />

        <DateInput
          label="Collected Date"
          placeholder="Pick date"
          clearable
          valueFormat="YYYY-MM-DD"
          maxDate={new Date()}
          {...form.getInputProps("collected_date")}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
