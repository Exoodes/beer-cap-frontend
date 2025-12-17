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
import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowLeft,
  IconBeer,
  IconCalendar,
  IconPencil,
  IconStar,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { deleteCap, getCapById } from "../../api/beerCaps";
import { getImageUrl } from "../../utils/imageUtils";
import { EditCapModal } from "./EditCapModal";

export function CapDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Modal state for editing
  const [opened, { open, close }] = useDisclosure(false);

  // 1. Fetch Single Cap Data
  const {
    data: cap,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["beerCap", id],
    queryFn: () => getCapById(Number(id)),
    enabled: !!id,
  });

  // 2. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCap,
    onSuccess: () => {
      // Refresh the dashboard list so the deleted item is gone
      queryClient.invalidateQueries({ queryKey: ["beerCaps"] });
      // Navigate back to home
      navigate("/");
    },
    onError: () => {
      alert("Failed to delete cap");
    },
  });

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this cap? This cannot be undone.",
      )
    ) {
      deleteMutation.mutate(Number(id));
    }
  };

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
      {/* Edit Modal Component (Hidden by default) */}
      <EditCapModal opened={opened} close={close} cap={cap} />

      {/* Back Button */}
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => navigate(-1)}
        mb="lg"
      >
        Back to Dashboard
      </Button>

      <Grid gutter="xl">
        {/* Left Column: Big Image */}
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

        {/* Right Column: Details */}
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
                    {/* Try to display brand if available in the type */}
                    <Text fw={500}>
                      {/* Now this won't error */}
                      {cap.beer.beer_brand?.name ||
                        cap.beer.brand?.name ||
                        "Unknown Brand"}
                    </Text>
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
              <Button
                size="md"
                variant="light"
                onClick={open}
                leftSection={<IconPencil size={16} />}
              >
                Edit Details
              </Button>

              <Button
                size="md"
                color="red"
                variant="subtle"
                onClick={handleDelete}
                loading={deleteMutation.isPending}
                leftSection={<IconTrash size={16} />}
              >
                Delete Cap
              </Button>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
