import {
  Alert,
  Center,
  Container,
  Loader,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconBeer } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCap, getAllCaps } from "../../api/beerCaps";
import { BeerCapCard } from "../../components/BeerCapCard";

export function DashboardPage() {
  const queryClient = useQueryClient();

  // 1. Fetch Data using TanStack Query
  const {
    data: caps = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["beerCaps"], // Unique key for caching
    queryFn: getAllCaps,
  });

  // 2. Setup Delete Mutation (for optimistic updates or refetching)
  const deleteMutation = useMutation({
    mutationFn: deleteCap,
    onSuccess: () => {
      // Invalidate cache to trigger a re-fetch automatically
      queryClient.invalidateQueries({ queryKey: ["beerCaps"] });
    },
    onError: () => {
      alert("Failed to delete cap");
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this cap?")) {
      deleteMutation.mutate(id);
    }
  };

  // 3. Render States
  if (isLoading) {
    return (
      <Center h={300}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Container py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          Failed to load beer caps. Is the backend running?
        </Alert>
      </Container>
    );
  }

  // 4. Render Success
  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="lg">
        My Collection ({caps.length})
      </Title>

      {caps.length === 0 ? (
        <Center h={200} display="flex" style={{ flexDirection: "column" }}>
          <IconBeer size={48} color="gray" style={{ opacity: 0.5 }} />
          <Text c="dimmed" mt="md">
            No caps found. Start by adding one!
          </Text>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
          {caps.map((cap) => (
            <BeerCapCard key={cap.id} cap={cap} onDelete={handleDelete} />
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
