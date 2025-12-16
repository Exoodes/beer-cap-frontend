import {
  Badge,
  Button,
  Center,
  Container,
  Grid,
  Group,
  Image,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconBeer,
  IconCalendar,
  IconStar,
  IconWorld,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getCapById } from "../../api/beerCaps";
import { getImageUrl } from "../../utils/imageUtils";

export function CapDetailPage() {
  const { id } = useParams(); // Get the "id" from the URL (e.g., /cap/42)
  const navigate = useNavigate();

  // 1. Fetch Single Cap Data
  const {
    data: cap,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["beerCap", id], // Unique cache key including ID
    queryFn: () => getCapById(Number(id)), // Call API
    enabled: !!id, // Only run if ID exists
  });

  if (isLoading)
    return (
      <Center h="50vh">
        <Loader size="xl" />
      </Center>
    );
  if (isError || !cap)
    return (
      <Center h="50vh">
        <Text>Cap not found</Text>
      </Center>
    );

  return (
    <Container size="lg" py="xl">
      {/* 2. Back Button */}
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => navigate(-1)}
        mb="lg"
      >
        Back to Dashboard
      </Button>

      <Grid gutter="xl">
        {/* 3. Left Column: Big Image */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper shadow="sm" radius="md" p="xs" withBorder>
            <Image
              src={getImageUrl(cap.presigned_url)}
              radius="md"
              alt={cap.beer.name}
              fallbackSrc="https://placehold.co/600x600?text=No+Image"
            />
          </Paper>
        </Grid.Col>

        {/* 4. Right Column: Details */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="lg">
            <div>
              <Group mb="xs">
                {cap.beer.country && (
                  <Badge
                    size="lg"
                    variant="dot"
                    color="gray"
                    leftSection={<IconWorld size={14} />}
                  >
                    {cap.beer.country.name}
                  </Badge>
                )}
                {cap.collected_date && (
                  <Badge
                    size="lg"
                    variant="outline"
                    color="blue"
                    leftSection={<IconCalendar size={14} />}
                  >
                    {cap.collected_date}
                  </Badge>
                )}
              </Group>

              <Title order={1}>{cap.beer.name}</Title>

              {cap.variant_name && (
                <Text size="xl" c="dimmed">
                  {cap.variant_name}
                </Text>
              )}
            </div>

            <Paper
              withBorder
              p="md"
              radius="md"
              bg="var(--mantine-color-gray-0)"
            >
              <Stack gap="md">
                <Group>
                  <ThemeIcon size="lg" variant="light" color="orange">
                    <IconBeer size={20} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      Brand
                    </Text>
                    {/* Note: Your API currently nests brand inside beer, check your type definition if getting error */}
                    <Text fw={500}>Unknown Brand</Text>
                  </div>
                </Group>

                <Group>
                  <ThemeIcon size="lg" variant="light" color="yellow">
                    <IconStar size={20} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      Rating
                    </Text>
                    <Text fw={500}>
                      {cap.beer.rating ? `${cap.beer.rating}/10` : "Unrated"}
                    </Text>
                  </div>
                </Group>
              </Stack>
            </Paper>

            <Group mt="xl">
              <Button size="md" variant="light">
                Edit Details
              </Button>
              <Button size="md" color="red" variant="subtle">
                Delete Cap
              </Button>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
