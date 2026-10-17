import {
  Button,
  Group,
  Image,
  LoadingOverlay,
  rem,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconCamera,
  IconPhoto,
  IconRefresh,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { formatFileSize } from "../utils/prepareImage";

// Pillow on the backend can't read SVG/HEIC from other browsers; Safari
// converts HEIC photos to JPEG when they are picked.
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
/** Generous: photos are shrunk in the browser before upload. */
const MAX_PICK_BYTES = 40 * 1024 * 1024;

interface ImageDropzoneProps {
  image: File | null;
  onDrop: (file: File) => void;
  onClear: () => void;
  onReject?: (message: string) => void;
  /** Shown while the picked photo is being prepared. */
  busy?: boolean;
}

export function ImageDropzone({
  image,
  onDrop,
  onClear,
  onReject,
  busy = false,
}: ImageDropzoneProps) {
  // Phones and tablets get camera/gallery buttons instead of drag and drop.
  const isTouch = useMediaQuery("(pointer: coarse)", false);
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const pick = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onDrop(file);
  };

  // Hidden native inputs: `capture` opens the rear camera directly.
  const inputs = (
    <>
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        aria-label="Take photo"
        onChange={(e) => {
          pick(e.currentTarget.files);
          e.currentTarget.value = "";
        }}
      />
      <input
        ref={galleryInput}
        type="file"
        accept="image/*"
        hidden
        aria-label="Choose from gallery"
        onChange={(e) => {
          pick(e.currentTarget.files);
          e.currentTarget.value = "";
        }}
      />
    </>
  );

  if (image) {
    return (
      <Stack align="center" pos="relative">
        {inputs}
        <LoadingOverlay visible={busy} />
        <Preview file={image} />
        <Text size="xs" c="dimmed">
          {formatFileSize(image.size)} · will be uploaded as shown
        </Text>
        <Group justify="center">
          {isTouch && (
            <Button
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={() => cameraInput.current?.click()}
            >
              Retake
            </Button>
          )}
          <Button
            color="red"
            variant="light"
            leftSection={<IconTrash size={16} />}
            onClick={onClear}
          >
            Remove
          </Button>
        </Group>
      </Stack>
    );
  }

  if (isTouch) {
    return (
      <Stack gap="xs" pos="relative">
        {inputs}
        <LoadingOverlay visible={busy} />
        <SimpleGrid cols={2} spacing="sm">
          <Button h={rem(96)} onClick={() => cameraInput.current?.click()}>
            <Stack gap={4} align="center">
              <IconCamera size={28} />
              Take photo
            </Stack>
          </Button>
          <Button
            h={rem(96)}
            variant="light"
            onClick={() => galleryInput.current?.click()}
          >
            <Stack gap={4} align="center">
              <IconPhoto size={28} />
              Gallery
            </Stack>
          </Button>
        </SimpleGrid>
        <Text size="xs" c="dimmed" ta="center">
          Fill the frame with the cap, on a plain background.
        </Text>
      </Stack>
    );
  }

  return (
    <Dropzone
      onDrop={(files) => onDrop(files[0])}
      onReject={(rejections) => {
        const code = rejections[0]?.errors[0]?.code;
        onReject?.(
          code === "file-too-large"
            ? "That file is too large (max 40 MB)."
            : "Use a JPEG, PNG or WebP image.",
        );
      }}
      maxSize={MAX_PICK_BYTES}
      accept={ACCEPTED_TYPES}
      maxFiles={1}
      loading={busy}
    >
      <Group
        justify="center"
        gap="xl"
        mih={220}
        style={{ pointerEvents: "none" }}
      >
        <Dropzone.Accept>
          <IconUpload
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-blue-6)",
            }}
            stroke={1.5}
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-red-6)",
            }}
            stroke={1.5}
          />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-dimmed)",
            }}
            stroke={1.5}
          />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            Drag image here or click to select
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            One photo of the cap: JPEG, PNG or WebP
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}

/**
 * One object URL per file, created and released in the same effect, so a
 * StrictMode remount can't leave the image pointing at a revoked URL.
 */
function Preview({ file }: { file: File }) {
  const img = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (img.current) img.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <Image ref={img} h={300} w="auto" fit="contain" radius="md" alt="Preview" />
  );
}
