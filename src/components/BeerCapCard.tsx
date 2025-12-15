import { Badge, Button, Card, Group, Image, Stack, Text } from "@mantine/core";
import { IconStar, IconTrash } from "@tabler/icons-react";
import type { BeerCap } from "../types";

interface BeerCapCardProps {
  cap: BeerCap;
  onDelete?: (id: number) => void;
}

export function BeerCapCard({ cap, onDelete }: BeerCapCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      {/* 1. Card Section for the Image */}
      {/* This ensures the image goes edge-to-edge without padding */}
      <Card.Section>
        <Image
          src={cap.presigned_url}
          height={160}
          alt={cap.beer.name}
          fallbackSrc="https://placehold.co/600x400?text=No+Image"
        />
      </Card.Section>

      {/* 2. Main Content */}
      <Stack mt="md" mb="xs" gap="xs">
        <Group justify="space-between">
          <Text fw={500} truncate>
            {cap.beer.name}
          </Text>
          {cap.beer.rating && (
            <Badge
              color="yellow"
              variant="light"
              leftSection={<IconStar size={12} />}
            >
              {cap.beer.rating}/10
            </Badge>
          )}
        </Group>

        {/* Variant Name (if it exists) */}
        {cap.variant_name && (
          <Text size="sm" c="dimmed">
            Variant: {cap.variant_name}
          </Text>
        )}

        {/* Country Badge */}
        {cap.beer.country && (
          <Badge color="gray" variant="outline">
            {cap.beer.country.name}
          </Badge>
        )}
      </Stack>

      {/* 3. Action Button (Delete) */}
      <Button
        color="red"
        variant="light"
        fullWidth
        mt="md"
        radius="md"
        leftSection={<IconTrash size={16} />}
        onClick={() => onDelete?.(cap.id)}
      >
        Delete
      </Button>
    </Card>
  );
}
