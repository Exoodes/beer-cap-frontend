import {
  Alert,
  Button,
  Center,
  Container,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconBeer, IconSearch } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { deleteCap, getAllCaps } from "../../api/beerCaps";
import { BeerCapCard } from "../../components/BeerCapCard";
import { notifySuccess } from "../../utils/notify";
import { CapFilterBar } from "./CapFilterBar";
import {
  type CapFilters,
  DEFAULT_FILTERS,
  facetOptions,
  filterAndSortCaps,
  hasActiveFilters,
} from "./capFilters";
import { useCapFilters } from "./useCapFilters";

export function DashboardPage() {
  const queryClient = useQueryClient();

  const {
    data: caps,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["beerCaps"],
    queryFn: getAllCaps,
  });

  // Filters live in the URL, so refresh, back navigation and bookmarks keep them.
  const [filters, setFilters] = useCapFilters();
  const updateFilters = (changes: Partial<CapFilters>) =>
    setFilters({ ...filters, ...changes });
  const clearFilters = () =>
    setFilters({ ...DEFAULT_FILTERS, sort: filters.sort });

  const allCaps = useMemo(() => caps ?? [], [caps]);
  const visibleCaps = useMemo(
    () => filterAndSortCaps(allCaps, filters),
    [allCaps, filters],
  );
  const countryOptions = useMemo(
    () => facetOptions(allCaps, "country"),
    [allCaps],
  );
  const brandOptions = useMemo(() => facetOptions(allCaps, "brand"), [allCaps]);
  const filtering = hasActiveFilters(filters);

  // 2. Setup Delete Mutation (for optimistic updates or refetching)
  const deleteMutation = useMutation({
    mutationFn: deleteCap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beerCaps"] });
      notifySuccess("Cap deleted.");
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

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" align="baseline" mb="lg">
        <Title order={2}>My Collection</Title>
        <Text c="dimmed" aria-live="polite">
          {filtering
            ? `Showing ${visibleCaps.length} of ${allCaps.length} caps`
            : `${allCaps.length} caps`}
        </Text>
      </Group>

      {allCaps.length === 0 ? (
        <Center h={200} display="flex" style={{ flexDirection: "column" }}>
          <IconBeer size={48} color="gray" style={{ opacity: 0.5 }} />
          <Text c="dimmed" mt="md">
            No caps found. Start by adding one!
          </Text>
        </Center>
      ) : (
        <>
          <CapFilterBar
            filters={filters}
            countryOptions={countryOptions}
            brandOptions={brandOptions}
            onChange={updateFilters}
            onClear={clearFilters}
            canClear={filtering}
          />

          {visibleCaps.length === 0 ? (
            <Center h={200}>
              <Stack align="center" gap="xs">
                <IconSearch size={40} color="gray" style={{ opacity: 0.5 }} />
                <Text c="dimmed">No caps match these filters.</Text>
                <Button variant="light" onClick={clearFilters}>
                  Clear filters
                </Button>
              </Stack>
            </Center>
          ) : (
            <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 4 }} spacing="lg">
              {visibleCaps.map((cap) => (
                <BeerCapCard key={cap.id} cap={cap} onDelete={handleDelete} />
              ))}
            </SimpleGrid>
          )}
        </>
      )}
    </Container>
  );
}
