import { Badge, Button, Card, Group, Image, Stack, Text } from "@mantine/core";
import { IconStar, IconTrash } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import type { BeerCap } from "../types";
import { getImageUrl } from "../utils/imageUtils";

interface BeerCapCardProps {
  cap: BeerCap;
  onDelete?: (id: number) => void;
}

export function BeerCapCard({ cap, onDelete }: BeerCapCardProps) {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      component={Link}
      to={`/cap/${cap.id}`}
      style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}
    >
      <Card.Section>
        <Image
          src={getImageUrl(cap.presigned_url)}
          height={160}
          alt={cap.beer.name}
          fallbackSrc="https://placehold.co/600x400?text=No+Image"
        />
      </Card.Section>

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

        {cap.variant_name && (
          <Text size="sm" c="dimmed">
            Variant: {cap.variant_name}
          </Text>
        )}

        {cap.beer.country && (
          <Badge color="gray" variant="outline">
            {cap.beer.country.name}
          </Badge>
        )}
      </Stack>

      <Button
        color="red"
        variant="light"
        fullWidth
        mt="md"
        radius="md"
        leftSection={<IconTrash size={16} />}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete?.(cap.id);
        }}
      >
        Delete
      </Button>
    </Card>
  );
}