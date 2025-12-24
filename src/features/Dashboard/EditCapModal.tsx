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
import { useEffect } from "react";
import { updateBeer, updateCap } from "../../api/beerCaps";
import type { BeerCap } from "../../types";

interface EditCapModalProps {
  opened: boolean;
  close: () => void;
  cap: BeerCap;
}

export function EditCapModal({ opened, close, cap }: EditCapModalProps) {
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      variant_name: "",
      rating: 0,
      collected_date: null as Date | null,
    },
    validate: {
      rating: (value) =>
        value < 0 || value > 10 ? "Rating must be between 0-10" : null,
    },
  });

  useEffect(() => {
    if (opened) {
      form.setValues({
        variant_name: cap.variant_name || "",
        rating: cap.beer.rating || 0,
        collected_date: cap.collected_date
          ? new Date(cap.collected_date)
          : null,
      });
    }
  }, [opened, cap]);

  const mutation = useMutation({
    mutationFn: async (values: typeof form.values) => {
      const beerId = cap.beer?.id;
      const capId = cap.id;

      if (!capId) throw new Error("Missing Cap ID");

      // 1. Update Beer Rating first (if changed)
      // The backend PATCH /beers/{id}/ expects beer_cap_id as a query param
      if (values.rating !== (cap.beer?.rating || 0)) {
        if (!beerId)
          throw new Error("Cannot update rating: Cap has no associated beer.");

        await updateBeer(beerId, capId, { rating: values.rating });
      }

      // 2. Prepare Cap Payload
      const dateString = values.collected_date
        ? values.collected_date.toISOString().split("T")[0]
        : null;

      const capPayload = {
        variant_name: values.variant_name,
        collected_date: dateString,
      };

      // 3. Update Cap Details
      await updateCap(capId, capPayload);
    },
    onSuccess: () => {
      // Correct invalidation
      queryClient.invalidateQueries({ queryKey: ["beerCap", cap.id] });
      queryClient.invalidateQueries({ queryKey: ["beerCaps"] });
      close();
    },
    // ... rest of the component
  });

  return (
    <Modal opened={opened} onClose={close} title="Edit Cap Details" centered>
      <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
        <Stack>
          {/* Read-only ID display for debugging */}
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
    </Modal>
  );
}
