import {
  Button,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getAllCaps, replaceCapImage, updateCap } from "../../api/beerCaps";
import { getBeers } from "../../api/references";
import { CapCircle } from "../../components/CapCircle";
import type { Choice } from "../../components/CreatablePicker";
import { ImageDropzone } from "../../components/ImageDropzone";
import type { BeerCap, BeerCapUpdate } from "../../types";
import { notifyError, notifySuccess } from "../../utils/notify";
import { prepareImageForUpload } from "../../utils/prepareImage";
import { groupCapsByBeer } from "../AddCap/matching";
import { BeerPicker } from "../AddCap/pickers";

interface EditCapModalProps {
  opened: boolean;
  close: () => void;
  cap: BeerCap;
}

export function EditCapModal({ opened, close, cap }: EditCapModalProps) {
  const isPhone = useMediaQuery("(max-width: 36em)");
  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Edit cap"
      size="lg"
      fullScreen={isPhone}
    >
      {/* Mounted per opening, so the form always starts from the current cap. */}
      {opened && <EditCapForm cap={cap} close={close} />}
    </Modal>
  );
}

function EditCapForm({ cap, close }: { cap: BeerCap; close: () => void }) {
  const queryClient = useQueryClient();
  const { data: beers = [] } = useQuery({
    queryKey: ["beers"],
    queryFn: getBeers,
  });
  const { data: caps = [] } = useQuery({
    queryKey: ["beerCaps"],
    queryFn: getAllCaps,
  });
  const capsByBeer = useMemo(() => groupCapsByBeer(caps), [caps]);

  const [beer, setBeer] = useState<Choice>({ id: cap.beer.id });
  const [photo, setPhoto] = useState<File | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [variant, setVariant] = useState(cap.variant_name ?? "");
  // Mantine 8 date inputs use "YYYY-MM-DD" strings, like the API.
  const [collected, setCollected] = useState<string | null>(
    cap.collected_date ?? null,
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (photo) await replaceCapImage(cap.id, photo);
      // Empty fields are sent as null so clearing them actually saves.
      const changes: BeerCapUpdate = {
        variant_name: variant.trim() || null,
        collected_date: collected || null,
      };
      if ("id" in beer && beer.id !== cap.beer.id) changes.beer_id = beer.id;
      return updateCap(cap.id, changes);
    },
    onSuccess: () => {
      for (const key of [["beerCap", cap.id], ["beerCaps"], ["beers"]]) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      notifySuccess("Cap updated.");
      close();
    },
  });

  const pickPhoto = async (picked: File) => {
    setPreparing(true);
    try {
      setPhoto(await prepareImageForUpload(picked));
    } finally {
      setPreparing(false);
    }
  };

  return (
    <Stack gap="lg">
      <BeerPicker
        beers={beers}
        capsByBeer={capsByBeer}
        value={beer}
        onChange={setBeer}
        allowCreate={false}
      />

      <Stack gap="xs">
        <Text size="sm" fw={500}>
          Photo
        </Text>
        <Group gap="md" wrap="nowrap" align="flex-start">
          <CapCircle cap={cap} alt="Current photo" size={72} />
          <Text size="sm" c="dimmed">
            {photo
              ? "The new photo below replaces this one when you save."
              : "To replace this photo, add a new one below."}
          </Text>
        </Group>
        <ImageDropzone
          image={photo}
          onDrop={pickPhoto}
          onClear={() => setPhoto(null)}
          onReject={(message) =>
            notifyError(new Error(message), "Photo not added")
          }
          busy={preparing}
        />
      </Stack>

      <SimpleGrid cols={{ base: 1, xs: 2 }}>
        <TextInput
          label="Variant"
          description="Optional"
          placeholder="e.g. Christmas edition, 2023 design"
          value={variant}
          onChange={(event) => setVariant(event.currentTarget.value)}
        />
        <DateInput
          label="Collected"
          description="When you got it"
          valueFormat="D. M. YYYY"
          clearable
          maxDate={new Date()}
          value={collected}
          onChange={setCollected}
        />
      </SimpleGrid>

      <Group justify="flex-end">
        <Button variant="default" onClick={close}>
          Cancel
        </Button>
        <Button
          loading={mutation.isPending}
          disabled={preparing}
          onClick={() => mutation.mutate()}
        >
          Save changes
        </Button>
      </Group>
    </Stack>
  );
}
