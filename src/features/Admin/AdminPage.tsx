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
  IconEdit,
  IconPlus,
  IconRobot,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  generateAllAugmentations,
  generateEmbeddings,
  generateIndex,
} from "../../api/admin";
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
import type { Beer, BeerBrand, Country } from "../../types";

export function AdminPage() {
  const queryClient = useQueryClient();
  const [augCount, setAugCount] = useState<number>(5);

  const [editingBeer, setEditingBeer] = useState<Beer | null>(null);
  const [editingBrand, setEditingBrand] = useState<BeerBrand | null>(null);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);

  const { data: beers = [] } = useQuery({ queryKey: ["beers"], queryFn: getBeers });
  const { data: brands = [] } = useQuery({ queryKey: ["brands"], queryFn: getBrands });
  const { data: countries = [] } = useQuery({ queryKey: ["countries"], queryFn: getCountries });

  const brandForm = useForm({
    initialValues: { name: "" },
    validate: { name: (v) => (v.length < 1 ? "Required" : null) },
  });

  const countryForm = useForm({
    initialValues: { name: "", description: "" },
    validate: { name: (v) => (v.length < 1 ? "Required" : null) },
  });

  const editBeerForm = useForm({
    initialValues: { 
      name: "", 
      rating: 0, 
      beer_brand_id: null as string | null, 
      country_id: null as string | null 
    },
  });

  const editBrandForm = useForm({ initialValues: { name: "" } });
  const editCountryForm = useForm({ initialValues: { name: "", description: "" } });

  useEffect(() => {
    if (editingBeer) {
      editBeerForm.setValues({ 
        name: editingBeer.name, 
        rating: editingBeer.rating,
        beer_brand_id: (editingBeer.brand?.id || editingBeer.beer_brand?.id)?.toString() || null,
        country_id: editingBeer.country?.id?.toString() || null
      });
    }
  }, [editingBeer]);

  useEffect(() => {
    if (editingBrand) editBrandForm.setValues({ name: editingBrand.name });
  }, [editingBrand]);

  useEffect(() => {
    if (editingCountry) editCountryForm.setValues({ name: editingCountry.name, description: editingCountry.description || "" });
  }, [editingCountry]);

  const mutationAug = useMutation({ mutationFn: generateAllAugmentations });
  const mutationEmb = useMutation({ mutationFn: generateEmbeddings });
  const mutationIdx = useMutation({ mutationFn: generateIndex });

  const createBrandMut = useMutation({
    mutationFn: createBrand,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["brands"] }); brandForm.reset(); }
  });

  const createCountryMut = useMutation({
    mutationFn: (vals: { name: string; description: string }) => createCountry(vals.name, vals.description),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["countries"] }); countryForm.reset(); }
  });

  const updateBeerMut = useMutation({
    mutationFn: (vals: { id: number; capId: number; name: string; rating: number; beer_brand_id: number | null; country_id: number | null }) =>
      updateBeer(vals.id, vals.capId, { 
        name: vals.name, 
        rating: vals.rating, 
        beer_brand_id: vals.beer_brand_id, 
        country_id: vals.country_id 
      }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["beers"] }); setEditingBeer(null); }
  });

  const updateBrandMut = useMutation({
    mutationFn: (vals: { id: number; name: string }) => updateBrand(vals.id, { name: vals.name }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["brands"] }); setEditingBrand(null); }
  });

  const updateCountryMut = useMutation({
    mutationFn: (vals: { id: number; name: string; description: string }) =>
      updateCountry(vals.id, { name: vals.name, description: vals.description }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["countries"] }); setEditingCountry(null); }
  });

  const deleteBeerMut = useMutation({
    mutationFn: deleteBeer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["beers"] })
  });

  const deleteBrandMut = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["brands"] })
  });

  const deleteCountryMut = useMutation({
    mutationFn: deleteCountry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["countries"] })
  });

  const handleConfirmDelete = (type: string, name: string, action: () => void) => {
    if (window.confirm(`Delete ${type} "${name}"?`)) action();
  };

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="xl">⚙️ Administration Dashboard</Title>

      <Tabs defaultValue="maintenance">
        <Tabs.List mb="lg">
          <Tabs.Tab value="maintenance" leftSection={<IconRobot size={16} />}>AI Pipeline</Tabs.Tab>
          <Tabs.Tab value="beers" leftSection={<IconDatabase size={16} />}>Beers</Tabs.Tab>
          <Tabs.Tab value="brands" leftSection={<IconCertificate size={16} />}>Brands</Tabs.Tab>
          <Tabs.Tab value="countries" leftSection={<IconWorld size={16} />}>Countries</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="maintenance">
          <Stack gap="md">
            <Alert icon={<IconAlertCircle size={16} />} title="Warning" color="orange">AI tasks are resource intensive.</Alert>
            <Paper withBorder p="md" radius="md">
              <Group align="flex-end">
                <NumberInput label="Augmentation Variations" value={augCount} onChange={(v) => setAugCount(Number(v))} min={1} max={20} />
                <Button loading={mutationAug.isPending} onClick={() => mutationAug.mutate(augCount)}>Start</Button>
              </Group>
            </Paper>
            <Group>
              <Button loading={mutationEmb.isPending} onClick={() => mutationEmb.mutate()}>Extract Features</Button>
              <Button loading={mutationIdx.isPending} onClick={() => mutationIdx.mutate()}>Rebuild Index</Button>
            </Group>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="beers">
          <Table striped>
            <Table.Thead>
              <Table.Tr><Table.Th>Name</Table.Th><Table.Th>Brand</Table.Th><Table.Th>Rating</Table.Th><Table.Th>Actions</Table.Th></Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {beers.map((beer) => (
                <Table.Tr key={beer.id}>
                  <Table.Td>{beer.name}</Table.Td>
                  <Table.Td>{beer.brand?.name || beer.beer_brand?.name || "N/A"}</Table.Td>
                  <Table.Td><Badge color="yellow">{beer.rating}/10</Badge></Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="subtle" color="blue" onClick={() => setEditingBeer(beer)}><IconEdit size={16} /></ActionIcon>
                      <ActionIcon variant="subtle" color="red" onClick={() => handleConfirmDelete("Beer", beer.name, () => deleteBeerMut.mutate(beer.id))}><IconTrash size={16} /></ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="brands">
          <Paper withBorder p="md" mb="xl" bg="gray.0">
            <form onSubmit={brandForm.onSubmit((v) => createBrandMut.mutate(v.name))}>
              <Group align="flex-end">
                <TextInput label="New Brand" placeholder="e.g. Guinness" style={{ flex: 1 }} {...brandForm.getInputProps("name")} />
                <Button type="submit" loading={createBrandMut.isPending} leftSection={<IconPlus size={16} />}>Add</Button>
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
                      <ActionIcon variant="subtle" color="blue" onClick={() => setEditingBrand(brand)}><IconEdit size={16} /></ActionIcon>
                      <ActionIcon variant="subtle" color="red" onClick={() => handleConfirmDelete("Brand", brand.name, () => deleteBrandMut.mutate(brand.id))}><IconTrash size={16} /></ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="countries">
          <Paper withBorder p="md" mb="xl" bg="gray.0">
            <form onSubmit={countryForm.onSubmit((v) => createCountryMut.mutate(v))}>
              <Stack gap="xs">
                <TextInput label="New Country" placeholder="e.g. Ireland" {...countryForm.getInputProps("name")} />
                <Textarea label="Description" {...countryForm.getInputProps("description")} />
                <Button type="submit" loading={createCountryMut.isPending}>Add Country</Button>
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
                      <ActionIcon variant="subtle" color="blue" onClick={() => setEditingCountry(c)}><IconEdit size={16} /></ActionIcon>
                      <ActionIcon variant="subtle" color="red" onClick={() => handleConfirmDelete("Country", c.name, () => deleteCountryMut.mutate(c.id))}><IconTrash size={16} /></ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>

      {/* EDIT BEER MODAL */}
      <Modal opened={!!editingBeer} onClose={() => setEditingBeer(null)} title="Edit Beer">
        <form onSubmit={editBeerForm.onSubmit((v) => {
          const capId = editingBeer?.caps?.[0]?.id || 0;
          if (editingBeer) {
            updateBeerMut.mutate({ 
              id: editingBeer.id, 
              capId, 
              name: v.name, 
              rating: v.rating,
              beer_brand_id: v.beer_brand_id ? parseInt(v.beer_brand_id) : null,
              country_id: v.country_id ? parseInt(v.country_id) : null
            });
          }
        })}>
          <Stack>
            <TextInput label="Name" {...editBeerForm.getInputProps("name")} />
            <NumberInput label="Rating" min={0} max={10} {...editBeerForm.getInputProps("rating")} />
            <Select 
              label="Beer Brand"
              placeholder="Select Brand"
              data={brands.map(b => ({ value: b.id.toString(), label: b.name }))}
              searchable
              clearable
              {...editBeerForm.getInputProps("beer_brand_id")}
            />
            <Select 
              label="Country"
              placeholder="Select Country"
              data={countries.map(c => ({ value: c.id.toString(), label: c.name }))}
              searchable
              clearable
              {...editBeerForm.getInputProps("country_id")}
            />
            <Button type="submit" loading={updateBeerMut.isPending}>Save</Button>
          </Stack>
        </form>
      </Modal>

      {/* EDIT BRAND MODAL */}
      <Modal opened={!!editingBrand} onClose={() => setEditingBrand(null)} title="Edit Brand">
        <form onSubmit={editBrandForm.onSubmit((v) => {
          if (editingBrand) updateBrandMut.mutate({ id: editingBrand.id, name: v.name });
        })}>
          <Stack>
            <TextInput label="Brand Name" {...editBrandForm.getInputProps("name")} />
            <Button type="submit" loading={updateBrandMut.isPending}>Save</Button>
          </Stack>
        </form>
      </Modal>

      {/* EDIT COUNTRY MODAL */}
      <Modal opened={!!editingCountry} onClose={() => setEditingCountry(null)} title="Edit Country">
        <form onSubmit={editCountryForm.onSubmit((v) => {
          if (editingCountry) updateCountryMut.mutate({ id: editingCountry.id, name: v.name, description: v.description });
        })}>
          <Stack>
            <TextInput label="Country Name" {...editCountryForm.getInputProps("name")} />
            <Textarea label="Description" {...editCountryForm.getInputProps("description")} />
            <Button type="submit" loading={updateCountryMut.isPending}>Save</Button>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}