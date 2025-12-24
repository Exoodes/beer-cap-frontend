import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Container,
  Divider,
  Group,
  NumberInput,
  Paper,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconAlertCircle,
  IconCertificate,
  IconDatabase,
  IconPlus,
  IconRobot,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  deleteAllAugmentedCaps,
  generateAllAugmentations,
  generateEmbeddings,
  generateIndex,
} from "../../api/admin";
import {
  createBrand,
  createCountry,
  deleteBeer,
  deleteBrand,
  deleteCountry,
  getBeers,
  getBrands,
  getCountries,
} from "../../api/references";

export function AdminPage() {
  const queryClient = useQueryClient();
  const [augCount, setAugCount] = useState<number>(5);

  // 1. Data Queries
  const { data: beers = [] } = useQuery({
    queryKey: ["beers"],
    queryFn: getBeers,
  });
  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });
  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  });

  // 2. Form States for creation
  const brandForm = useForm({
    initialValues: { name: "" },
    validate: {
      name: (value) => (value.length < 1 ? "Brand name is required" : null),
    },
  });

  const countryForm = useForm({
    initialValues: { name: "", description: "" },
    validate: {
      name: (value) => (value.length < 1 ? "Country name is required" : null),
    },
  });

  // 3. AI Pipeline Mutations
  const mutationAug = useMutation({
    mutationFn: (count: number) => generateAllAugmentations(count),
    onSuccess: (res) => alert(res.message),
    onError: () => alert("Augmentation failed. Check backend logs (OOM risk)."),
  });

  const mutationEmb = useMutation({
    mutationFn: generateEmbeddings,
    onSuccess: (res) => alert(res.message),
  });

  const mutationIdx = useMutation({
    mutationFn: generateIndex,
    onSuccess: (res) => alert(res.message),
  });

  const mutationDelAug = useMutation({
    mutationFn: deleteAllAugmentedCaps,
    onSuccess: () => alert("Augmented data cleared successfully."),
  });

  // 4. Reference Cleanup Mutations
  const createBrandMut = useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      brandForm.reset();
    },
  });

  const createCountryMut = useMutation({
    mutationFn: (values: { name: string; description: string }) =>
      createCountry(values.name, values.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      countryForm.reset();
    },
  });

  const deleteBeerMut = useMutation({
    mutationFn: deleteBeer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["beers", "beerCaps"] }),
  });

  const deleteBrandMut = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["brands"] }),
  });

  const deleteCountryMut = useMutation({
    mutationFn: deleteCountry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["countries"] }),
  });

  // Helper for confirmations
  const handleConfirmAction = (
    type: string,
    name: string,
    action: () => void
  ) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${type}: "${name}"? This cannot be undone.`
      )
    ) {
      action();
    }
  };

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="xl">
        ⚙️ Administration Dashboard
      </Title>

      <Tabs defaultValue="maintenance">
        <Tabs.List mb="lg">
          <Tabs.Tab value="maintenance" leftSection={<IconRobot size={16} />}>
            AI Pipeline
          </Tabs.Tab>
          <Tabs.Tab value="beers" leftSection={<IconDatabase size={16} />}>
            Beers
          </Tabs.Tab>
          <Tabs.Tab value="brands" leftSection={<IconCertificate size={16} />}>
            Brands
          </Tabs.Tab>
          <Tabs.Tab value="countries" leftSection={<IconWorld size={16} />}>
            Countries
          </Tabs.Tab>
        </Tabs.List>

        {/* AI PIPELINE PANEL */}
        <Tabs.Panel value="maintenance">
          <Stack gap="md">
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Performance Warning"
              color="orange"
            >
              These tasks use heavy AI models (U²-Net, CLIP). Ensure your backend
              has enough RAM (4GB+) and run them sequentially.
            </Alert>

            <Paper withBorder p="md" radius="md">
              <Text fw={500} mb="sm">
                1. Image Augmentation
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                Preprocesses original images to create augmented variations for
                better search accuracy.
              </Text>
              <Group align="flex-end">
                <NumberInput
                  label="Variations per cap"
                  value={augCount}
                  onChange={(v) => setAugCount(Number(v))}
                  min={1}
                  max={20}
                />
                <Button
                  loading={mutationAug.isPending}
                  onClick={() => mutationAug.mutate(augCount)}
                >
                  Start Augmentation
                </Button>
              </Group>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Text fw={500} mb="sm">
                2. Feature Extraction
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                Generates AI embeddings (mathematical vectors) for all processed
                cap images.
              </Text>
              <Button
                loading={mutationEmb.isPending}
                onClick={() => mutationEmb.mutate()}
              >
                Generate Embeddings
              </Button>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Text fw={500} mb="sm">
                3. Search Indexing
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                Builds and uploads the FAISS index to MinIO for instant visual
                matching.
              </Text>
              <Button
                loading={mutationIdx.isPending}
                onClick={() => mutationIdx.mutate()}
              >
                Rebuild Index
              </Button>
            </Paper>

            <Paper
              withBorder
              p="md"
              radius="md"
              style={{ borderColor: "var(--mantine-color-red-6)" }}
            >
              <Text fw={500} c="red" mb="sm">
                System Cleanup
              </Text>
              <Button
                color="red"
                variant="light"
                leftSection={<IconTrash size={16} />}
                onClick={() =>
                  handleConfirmAction("SYSTEM DATA", "All Augmented Caps", () =>
                    mutationDelAug.mutate()
                  )
                }
              >
                Clear Augmented Database
              </Button>
            </Paper>
          </Stack>
        </Tabs.Panel>

        {/* BEERS PANEL */}
        <Tabs.Panel value="beers">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Beer Name</Table.Th>
                <Table.Th>Brand</Table.Th>
                <Table.Th>Global Rating</Table.Th>
                <Table.Th style={{ width: 80 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {beers.map((beer) => (
                <Table.Tr key={beer.id}>
                  <Table.Td fw={500}>{beer.name}</Table.Td>
                  <Table.Td>
                    {beer.brand?.name || beer.beer_brand?.name || "Unknown"}
                  </Table.Td>
                  <Table.Td>
                    <Badge color="yellow" variant="light">
                      {beer.rating}/10
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() =>
                        handleConfirmAction("BEER", beer.name, () =>
                          deleteBeerMut.mutate(beer.id)
                        )
                      }
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        {/* BRANDS PANEL */}
        <Tabs.Panel value="brands">
          <Paper withBorder p="md" mb="xl" radius="md" bg="gray.0">
            <Title order={4} mb="md">
              Create New Brand
            </Title>
            <form
              onSubmit={brandForm.onSubmit((values) =>
                createBrandMut.mutate(values.name)
              )}
            >
              <Group align="flex-end">
                <TextInput
                  label="Brand Name"
                  placeholder="e.g. BrewDog"
                  style={{ flex: 1 }}
                  required
                  {...brandForm.getInputProps("name")}
                />
                <Button
                  type="submit"
                  leftSection={<IconPlus size={16} />}
                  loading={createBrandMut.isPending}
                >
                  Save Brand
                </Button>
              </Group>
            </form>
          </Paper>

          <Divider label="Existing Brands" labelPosition="center" mb="lg" />

          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Brand Name</Table.Th>
                <Table.Th style={{ width: 80 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {brands.map((brand) => (
                <Table.Tr key={brand.id}>
                  <Table.Td>{brand.name}</Table.Td>
                  <Table.Td>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() =>
                        handleConfirmAction("BRAND", brand.name, () =>
                          deleteBrandMut.mutate(brand.id)
                        )
                      }
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        {/* COUNTRIES PANEL */}
        <Tabs.Panel value="countries">
          <Paper withBorder p="md" mb="xl" radius="md" bg="gray.0">
            <Title order={4} mb="md">
              Register New Country
            </Title>
            <form
              onSubmit={countryForm.onSubmit((values) =>
                createCountryMut.mutate(values)
              )}
            >
              <Stack gap="sm">
                <TextInput
                  label="Country Name"
                  placeholder="e.g. Belgium"
                  required
                  {...countryForm.getInputProps("name")}
                />
                <Textarea
                  label="Description"
                  placeholder="Optional details..."
                  {...countryForm.getInputProps("description")}
                />
                <Group justify="flex-end">
                  <Button
                    type="submit"
                    leftSection={<IconPlus size={16} />}
                    loading={createCountryMut.isPending}
                  >
                    Add Country
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>

          <Divider label="Active Countries" labelPosition="center" mb="lg" />

          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Country</Table.Th>
                <Table.Th style={{ width: 80 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {countries.map((country) => (
                <Table.Tr key={country.id}>
                  <Table.Td>{country.name}</Table.Td>
                  <Table.Td>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() =>
                        handleConfirmAction("COUNTRY", country.name, () =>
                          deleteCountryMut.mutate(country.id)
                        )
                      }
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}