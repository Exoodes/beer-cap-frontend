import { Button, Group, Image, rem, Stack, Text } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconPhoto, IconTrash, IconUpload, IconX } from "@tabler/icons-react";

interface ImageDropzoneProps {
  image: File | null;
  onDrop: (file: File) => void;
  onClear: () => void;
}

export function ImageDropzone({ image, onDrop, onClear }: ImageDropzoneProps) {
  // 1. If an image is selected, show the Preview
  if (image) {
    const previewUrl = URL.createObjectURL(image);
    return (
      <Stack align="center">
        <Image
          src={previewUrl}
          h={300}
          w="auto"
          fit="contain"
          radius="md"
          alt="Preview"
          onLoad={() => URL.revokeObjectURL(previewUrl)} // Clean up memory
        />
        <Button
          color="red"
          variant="light"
          leftSection={<IconTrash size={16} />}
          onClick={onClear}
        >
          Remove Image
        </Button>
      </Stack>
    );
  }

  // 2. Otherwise, show the Dropzone
  return (
    <Dropzone
      onDrop={(files) => onDrop(files[0])} 
      onReject={() => alert("File rejected! Make sure it is an image.")}
      maxSize={5 * 1024 * 1024}
      accept={IMAGE_MIME_TYPE}
      maxFiles={1}
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
            Attach one beer cap image (max 5mb)
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}
