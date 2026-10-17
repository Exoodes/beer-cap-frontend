// src/features/Admin/AdminPage.tsx
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Container,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Table,
  Tabs,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconAlertCircle,
  IconArchive,
  IconCertificate,
  IconDatabase,
  IconEdit,
  IconPlus,
  IconRobot,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  generateAllAugmentations,
  generateEmbeddings,
  generateIndex,
} from "../../api/admin";
import { createBackup, deleteBackup, getBackups } from "../../api/backups";
import { updateBeer } from "../../api/beerCaps";
import {
  createBrand,
  createCountry,
  deleteBeer,
  deleteBrand,
  deleteCountry,
  getBeers,
  getBrands,
  getCountries,
  updateBrand,
  updateCountry,
} from "../../api/references";
import { useMatchingEnabled } from "../../hooks/useMatchingEnabled";
import type { Beer, BeerBrandWithBeers, CountryWithBeers } from "../../types";
import { confirmDelete } from "../../utils/confirm";
import { pluralCaps } from "../../utils/format";
import { notifySuccess } from "../../utils/notify";
import { wordFilter } from "../../utils/search";

export function AdminPage() {
  const queryClient = useQueryClient();
  const matchingEnabled = useMatchingEnabled();
  const [augCount, setAugCount] = useState<number>(5);

  const [editingBeer, setEditingBeer] = useState<Beer | null>(null);
  const [editingBrand, setEditingBrand] = useState<BeerBrandWithBeers | null>(
    null,
  );
  const [editingCountry, setEditingCountry] = useState<CountryWithBeers | null>(
    null,
  );

  const { data: backups = [], isLoading: isLoadingBackups } = useQuery({
    queryKey: ["backups"],
    queryFn: getBackups,
  });

  const createBackupMut = useMutation({
    mutationFn: createBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      notifySuccess("Backup created.");
    },
  });

  const deleteBackupMut = useMutation({
    mutationFn: deleteBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      notifySuccess("Backup deleted.");
    },
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

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

  const brandForm = useForm({
    initialValues: { name: "" },
    validate: { name: (v) => (v.length < 1 ? "Required" : null) },
  });

  const countryForm = useForm({
    initialValues: { name: "", description: "" },
    validate: { name: (v) => (v.length < 1 ? "Required" : null) },
  });

  const onPipelineStep = (result: { message: string }) =>
    notifySuccess(result.message);
  const mutationAug = useMutation({
    mutationFn: generateAllAugmentations,
    onSuccess: onPipelineStep,
  });
  const mutationEmb = useMutation({
    mutationFn: generateEmbeddings,
    onSuccess: onPipelineStep,
  });
  const mutationIdx = useMutation({
    mutationFn: generateIndex,
    onSuccess: onPipelineStep,
  });

  const createBrandMut = useMutation({
    mutationFn: createBrand,
    onSuccess: (brand) => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      brandForm.reset();
      notifySuccess(`Brand "${brand.name}" added.`);
    },
  });

  const createCountryMut = useMutation({
    mutationFn: (vals: { name: string; description: string }) =>
      createCountry({
        name: vals.name,
        description: vals.description.trim() || null,
      }),
    onSuccess: (country) => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      countryForm.reset();
      notifySuccess(`Country "${country.name}" added.`);
    },
  });

  const deleteBeerMut = useMutation({
    mutationFn: deleteBeer,
    onSuccess: () => {
      // Deleting a beer also deletes its caps.
      queryClient.invalidateQueries({ queryKey: ["beers"] });
      queryClient.invalidateQueries({ queryKey: ["beerCaps"] });
      notifySuccess("Beer deleted.");
    },
  });

  const deleteBrandMut = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      notifySuccess("Brand deleted.");
    },
  });

  const deleteCountryMut = useMutation({
    mutationFn: deleteCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      notifySuccess("Country deleted.");
    },
  });

  const confirmDeleteBeer = (beer: Beer) => {
    const caps = beer.caps?.length ?? beer.cap_count ?? 0;
    confirmDelete({
      title: `Delete ${beer.name}?`,
      message:
        caps === 0
          ? "This can't be undone."
          : caps === 1
            ? "Its cap and the cap's photo are deleted too. This can't be undone."
            : `Its ${pluralCaps(caps)} and their photos are deleted too. This can't be undone.`,
      onConfirm: () => deleteBeerMut.mutate(beer.id),
    });
  };

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="xl">
        Admin
      </Title>

      <Tabs defaultValue="beers">
        <Tabs.List mb="lg">
          <Tabs.Tab value="beers" leftSection={<IconDatabase size={16} />}>
            Beers
          </Tabs.Tab>
          <Tabs.Tab value="brands" leftSection={<IconCertificate size={16} />}>
            Brands
          </Tabs.Tab>
          <Tabs.Tab value="countries" leftSection={<IconWorld size={16} />}>
            Countries
          </Tabs.Tab>
          <Tabs.Tab value="backups" leftSection={<IconArchive size={16} />}>
            Backups
          </Tabs.Tab>
          {matchingEnabled && (
            <Tabs.Tab value="maintenance" leftSection={<IconRobot size={16} />}>
              AI Pipeline
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value="maintenance">
          <Stack gap="md">
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Warning"
              color="orange"
            >
              AI tasks are resource intensive.
            </Alert>
            <Paper withBorder p="md" radius="md">
              <Group align="flex-end">
                <NumberInput
                  label="Augmentation Variations"
                  value={augCount}
                  onChange={(v) => setAugCount(Number(v))}
                  min={1}
                  max={20}
                />
                <Button
                  loading={mutationAug.isPending}
                  onClick={() => mutationAug.mutate(augCount)}
                >
                  Start
                </Button>
              </Group>
            </Paper>
            <Group>
              <Button
                loading={mutationEmb.isPending}
                onClick={() => mutationEmb.mutate()}
              >
                Extract Features
              </Button>
              <Button
                loading={mutationIdx.isPending}
                onClick={() => mutationIdx.mutate()}
              >
                Rebuild Index
              </Button>
            </Group>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="beers">
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Brand</Table.Th>
                <Table.Th>Rating</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {beers.map((beer) => (
                <Table.Tr key={beer.id}>
                  <Table.Td>{beer.name}</Table.Td>
                  <Table.Td>{beer.beer_brand?.name ?? "N/A"}</Table.Td>
                  <Table.Td>
                    <Badge color="yellow">{beer.rating ?? 0}/10</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => setEditingBeer(beer)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => confirmDeleteBeer(beer)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="brands">
          <Paper withBorder p="md" mb="xl" bg="gray.0">
            <form
              onSubmit={brandForm.onSubmit((v) =>
                createBrandMut.mutate(v.name),
              )}
            >
              <Group align="flex-end">
                <TextInput
                  label="New Brand"
                  placeholder="e.g. Guinness"
                  style={{ flex: 1 }}
                  {...brandForm.getInputProps("name")}
                />
                <Button
                  type="submit"
                  loading={createBrandMut.isPending}
                  leftSection={<IconPlus size={16} />}
                >
                  Add
                </Button>
              </Group>
            </form>
          </Paper>
          <Table striped>
            <Table.Tbody>
              {brands.map((brand) => (
                <Table.Tr key={brand.id}>
                  <Table.Td>{brand.name}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => setEditingBrand(brand)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() =>
                          confirmDelete({
                            title: `Delete the brand ${brand.name}?`,
                            message: "This can't be undone.",
                            onConfirm: () => deleteBrandMut.mutate(brand.id),
                          })
                        }
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="countries">
          <Paper withBorder p="md" mb="xl" bg="gray.0">
            <form
              onSubmit={countryForm.onSubmit((v) => createCountryMut.mutate(v))}
            >
              <Stack gap="xs">
                <TextInput
                  label="New Country"
                  placeholder="e.g. Ireland"
                  {...countryForm.getInputProps("name")}
                />
                <Textarea
                  label="Description"
                  {...countryForm.getInputProps("description")}
                />
                <Button type="submit" loading={createCountryMut.isPending}>
                  Add Country
                </Button>
              </Stack>
            </form>
          </Paper>
          <Table striped>
            <Table.Tbody>
              {countries.map((c) => (
                <Table.Tr key={c.id}>
                  <Table.Td>{c.name}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => setEditingCountry(c)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() =>
                          confirmDelete({
                            title: `Delete ${c.name}?`,
                            message: "This can't be undone.",
                            onConfirm: () => deleteCountryMut.mutate(c.id),
                          })
                        }
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="backups">
          <Paper withBorder p="md" mb="xl" bg="gray.0">
            <Group justify="space-between">
              <div>
                <Title order={4}>Manual Backups</Title>
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Note"
                  color="blue"
                  mt="xs"
                >
                  Backups are saved safely to the host disk. S3 Buckets are
                  saved as folders, databases as SQL archives.
                </Alert>
              </div>
              <Button
                loading={createBackupMut.isPending}
                onClick={() => createBackupMut.mutate()}
                leftSection={<IconPlus size={16} />}
              >
                Trigger Full Backup
              </Button>
            </Group>
          </Paper>

          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Size</Table.Th>
                <Table.Th>Created At</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {backups.map((backup) => (
                <Table.Tr key={backup.name}>
                  <Table.Td>{backup.name}</Table.Td>
                  <Table.Td>
                    <Badge
                      color={backup.is_dir ? "blue" : "grape"}
                      variant="light"
                    >
                      {backup.is_dir ? "MinIO Images" : "Postgres Dump"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{formatBytes(backup.size)}</Table.Td>
                  <Table.Td>
                    {new Date(backup.created_at).toLocaleString()}
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() =>
                        confirmDelete({
                          title: `Delete the backup ${backup.name}?`,
                          message:
                            "Its files are removed from the server. This can't be undone.",
                          onConfirm: () => deleteBackupMut.mutate(backup.name),
                        })
                      }
                      loading={deleteBackupMut.isPending}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
              {backups.length === 0 && !isLoadingBackups && (
                <Table.Tr>
                  <Table.Td colSpan={5} align="center">
                    No backups found.
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={!!editingBeer}
        onClose={() => setEditingBeer(null)}
        title="Edit Beer"
      >
        {editingBeer && (
          <EditBeerForm
            beer={editingBeer}
            brands={brands}
            countries={countries}
            onDone={() => setEditingBeer(null)}
          />
        )}
      </Modal>

      <Modal
        opened={!!editingBrand}
        onClose={() => setEditingBrand(null)}
        title="Edit Brand"
      >
        {editingBrand && (
          <EditBrandForm
            brand={editingBrand}
            onDone={() => setEditingBrand(null)}
          />
        )}
      </Modal>

      <Modal
        opened={!!editingCountry}
        onClose={() => setEditingCountry(null)}
        title="Edit Country"
      >
        {editingCountry && (
          <EditCountryForm
            country={editingCountry}
            onDone={() => setEditingCountry(null)}
          />
        )}
      </Modal>
    </Container>
  );
}

// The edit forms mount when their modal opens, so they start from the
// current values without syncing state in an effect.

function EditBeerForm({
  beer,
  brands,
  countries,
  onDone,
}: {
  beer: Beer;
  brands: BeerBrandWithBeers[];
  countries: CountryWithBeers[];
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm({
    initialValues: {
      name: beer.name,
      rating: beer.rating ?? 0,
      beer_brand_id: beer.beer_brand?.id.toString() ?? null,
      country_id: beer.country?.id.toString() ?? null,
    },
    validate: {
      name: (v) => (v.trim() ? null : "Required"),
      beer_brand_id: (v) => (v ? null : "Select a brand"),
    },
  });

  const mutation = useMutation({
    mutationFn: (v: typeof form.values) =>
      updateBeer(beer.id, {
        name: v.name.trim(),
        rating: v.rating,
        beer_brand_id: Number(v.beer_brand_id),
        // null removes the country.
        country_id: v.country_id ? Number(v.country_id) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beers"] });
      queryClient.invalidateQueries({ queryKey: ["beerCaps"] });
      notifySuccess("Beer updated.");
      onDone();
    },
  });

  return (
    <form onSubmit={form.onSubmit((v) => mutation.mutate(v))}>
      <Stack>
        <TextInput label="Name" {...form.getInputProps("name")} />
        <NumberInput
          label="Rating"
          min={0}
          max={10}
          {...form.getInputProps("rating")}
        />
        <Select
          label="Beer Brand"
          placeholder="Select Brand"
          data={brands.map((b) => ({ value: b.id.toString(), label: b.name }))}
          searchable
          filter={wordFilter}
          {...form.getInputProps("beer_brand_id")}
        />
        <Select
          label="Country"
          placeholder="No country"
          data={countries.map((c) => ({
            value: c.id.toString(),
            label: c.name,
          }))}
          searchable
          filter={wordFilter}
          clearable
          {...form.getInputProps("country_id")}
        />
        <Button type="submit" loading={mutation.isPending}>
          Save
        </Button>
      </Stack>
    </form>
  );
}

function EditBrandForm({
  brand,
  onDone,
}: {
  brand: BeerBrandWithBeers;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm({
    initialValues: { name: brand.name },
    validate: { name: (v) => (v.trim() ? null : "Required") },
  });

  const mutation = useMutation({
    mutationFn: (v: typeof form.values) =>
      updateBrand(brand.id, { name: v.name.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["beers"] });
      queryClient.invalidateQueries({ queryKey: ["beerCaps"] });
      notifySuccess("Brand updated.");
      onDone();
    },
  });

  return (
    <form onSubmit={form.onSubmit((v) => mutation.mutate(v))}>
      <Stack>
        <TextInput label="Brand Name" {...form.getInputProps("name")} />
        <Button type="submit" loading={mutation.isPending}>
          Save
        </Button>
      </Stack>
    </form>
  );
}

function EditCountryForm({
  country,
  onDone,
}: {
  country: CountryWithBeers;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm({
    initialValues: {
      name: country.name,
      description: country.description ?? "",
    },
    validate: { name: (v) => (v.trim() ? null : "Required") },
  });

  const mutation = useMutation({
    mutationFn: (v: typeof form.values) =>
      updateCountry(country.id, {
        name: v.name.trim(),
        description: v.description.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      queryClient.invalidateQueries({ queryKey: ["beerCaps"] });
      notifySuccess("Country updated.");
      onDone();
    },
  });

  return (
    <form onSubmit={form.onSubmit((v) => mutation.mutate(v))}>
      <Stack>
        <TextInput label="Country Name" {...form.getInputProps("name")} />
        <Textarea label="Description" {...form.getInputProps("description")} />
        <Button type="submit" loading={mutation.isPending}>
          Save
        </Button>
      </Stack>
    </form>
  );
}
