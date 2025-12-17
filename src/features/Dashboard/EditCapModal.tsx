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
      // DEBUG: Log IDs to console to verify we aren't swapping them
      console.log(
        `[EditCap] Updating Cap ID: ${cap.id}, Beer ID: ${cap.beer.id}`,
      );

      // 1. Prepare Data
      const dateString = values.collected_date
        ? values.collected_date.toISOString().split("T")[0]
        : null;

      // Ensure we send the beer_id to keep the link alive
      const capPayload = {
        variant_name: values.variant_name,
        collected_date: dateString,
        beer_id: cap.beer.id,
      };

      // 2. Execute Updates (Beer First, then Cap)

      // Update Beer Rating (Only if changed)
      if (values.rating !== (cap.beer.rating || 0)) {
        if (!cap.beer.id)
          throw new Error("Missing Beer ID - Cannot update rating");
        console.log(`[EditCap] Updating Beer Rating to ${values.rating}...`);
        await updateBeer(cap.beer.id, cap.id, { rating: values.rating });
      }

      // Update Cap Details
      console.log(`[EditCap] Updating Cap Details...`);
      await updateCap(cap.id, capPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beerCap", String(cap.id)] });
      queryClient.invalidateQueries({ queryKey: ["beerCaps"] });
      close();
    },
    onError: (err) => {
      console.error("Mutation failed:", err);
      alert(
        "Failed to save. If you see a 404, this cap might be unlinked from its beer.",
      );
    },
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
