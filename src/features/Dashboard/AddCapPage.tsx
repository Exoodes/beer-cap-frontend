// src/features/Dashboard/AddCapPage.tsx

import {
  Button,
  Container,
  Group,
  LoadingOverlay,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconCheck, IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCap } from "../../api/beerCaps";
import { getBeers, getBrands, getCountries } from "../../api/references";
import { ImageDropzone } from "../../components/ImageDropzone";
import { notifyError, notifySuccess } from "../../utils/notify";
import { prepareImageForUpload } from "../../utils/prepareImage";

export function AddCapPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preparing, setPreparing] = useState(false);

  // 1. Fetch Reference Data
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

  // 2. Setup Form State
  const form = useForm({
    initialValues: {
      variant_name: "",
      collected_date: null as string | null, // "YYYY-MM-DD"
      isNewBeer: false,
      isNewBrand: false,
      isNewCountry: false,
      beer_id: null as string | null,
      brand_id: null as string | null,
      country_id: null as string | null,
      beer_name: "",
      brand_name: "",
      country_name: "",
      beer_rating: 0,
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!file) errors.file = "Image is required";
      if (values.isNewBeer) {
        if (!values.beer_name) errors.beer_name = "Beer Name is required";
        if (values.beer_rating < 0 || values.beer_rating > 10)
          errors.beer_rating = "Rating must be 0-10";
        if (values.isNewBrand && !values.brand_name)
          errors.brand_name = "Brand Name is required";
        if (!values.isNewBrand && !values.brand_id)
          errors.brand_id = "Select a Brand";
        if (values.isNewCountry && !values.country_name)
          errors.country_name = "Country Name is required";
        if (!values.isNewCountry && !values.country_id)
          errors.country_id = "Select a Country";
      } else {
        if (!values.beer_id) errors.beer_id = "Select a Beer";
      }
      return errors;
    },
  });

  const mutation = useMutation({
    mutationFn: createCap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beerCaps"] });
      queryClient.invalidateQueries({ queryKey: ["beers"] });
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["countries"] });
    },
  });

  const handlePick = async (picked: File) => {
    setPreparing(true);
    try {
      setFile(await prepareImageForUpload(picked));
      form.clearFieldError("file");
    } finally {
      setPreparing(false);
    }
  };

  const startNextCap = () => {
    // Caps are often added in a batch on the same day: keep the date.
    const { collected_date } = form.values;
    form.reset();
    form.setFieldValue("collected_date", collected_date);
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (values: typeof form.values, addAnother: boolean) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    if (values.variant_name)
      formData.append("variant_name", values.variant_name);
    if (values.collected_date) {
      formData.append("collected_date", values.collected_date);
    }
    if (values.isNewBeer) {
      formData.append("beer_name", values.beer_name);
      formData.append("rating", values.beer_rating.toString());
      if (values.isNewBrand) {
        formData.append("beer_brand_name", values.brand_name);
      } else if (values.brand_id) {
        formData.append("beer_brand_id", values.brand_id);
      }
      if (values.isNewCountry) {
        formData.append("country_name", values.country_name);
      } else if (values.country_id) {
        formData.append("country_id", values.country_id);
      }
    } else if (values.beer_id) {
      formData.append("beer_id", values.beer_id);
    }
    mutation.mutate(formData, {
      onSuccess: () => {
        if (addAnother) {
          notifySuccess("Cap added. Ready for the next one.");
          startNextCap();
        } else {
          notifySuccess("Cap added.");
          navigate("/");
        }
      },
    });
  };

  // UPDATED: Combined Beer and Brand label for the dropdown
  const beerOptions = beers.map((b) => {
    const brandName = b.beer_brand?.name ?? "Unknown Brand";
    return {
      value: b.id.toString(),
      label: `${b.name} (${brandName})`,
    };
  });

  const brandOptions = brands.map((b) => ({
    value: b.id.toString(),
    label: b.name,
  }));
  const countryOptions = countries.map((c) => ({
    value: c.id.toString(),
    label: c.name,
  }));

  return (
    <Container size="sm" py="xl">
      <Title mb="xl">➕ Add New Beer Cap</Title>

      <form onSubmit={form.onSubmit((values) => handleSubmit(values, false))}>
        <Stack gap="lg" pos="relative">
          <LoadingOverlay
            visible={mutation.isPending}
            overlayProps={{ radius: "sm", blur: 2 }}
          />

          <Paper withBorder p="md" radius="md">
            <Text fw={500} mb="xs">
              Cap Image *
            </Text>
            <ImageDropzone
              image={file}
              onDrop={handlePick}
              onClear={() => setFile(null)}
              onReject={(message) =>
                notifyError(new Error(message), "Photo not added")
              }
              busy={preparing}
            />
            {form.errors.file && (
              <Text c="red" size="sm" mt={4}>
                {form.errors.file}
              </Text>
            )}
          </Paper>

          <SimpleGrid cols={{ base: 1, xs: 2 }}>
            <TextInput
              label="Variant Name"
              placeholder="e.g. 'Gold Edition'"
              {...form.getInputProps("variant_name")}
            />
            <DateInput
              label="Collected Date"
              placeholder="Pick date"
              clearable
              valueFormat="YYYY-MM-DD"
              maxDate={new Date()}
              {...form.getInputProps("collected_date")}
            />
          </SimpleGrid>

          <Paper withBorder p="md" radius="md" bg="var(--mantine-color-gray-0)">
            <Group justify="space-between" mb="xs">
              <Text fw={500}>Beer Details</Text>
              <Switch
                label="Create New Beer?"
                {...form.getInputProps("isNewBeer", { type: "checkbox" })}
              />
            </Group>

            {!form.values.isNewBeer ? (
              <Select
                label="Select Beer"
                placeholder="Search for a beer..."
                data={beerOptions}
                searchable
                nothingFoundMessage="No beers found"
                {...form.getInputProps("beer_id")}
              />
            ) : (
              <Stack gap="sm">
                <TextInput
                  label="New Beer Name"
                  placeholder="e.g. Punk IPA"
                  required
                  {...form.getInputProps("beer_name")}
                />

                <NumberInput
                  label="Initial Beer Rating (0-10)"
                  placeholder="0"
                  min={0}
                  max={10}
                  {...form.getInputProps("beer_rating")}
                />

                <Group align="end" grow>
                  {!form.values.isNewBrand ? (
                    <Select
                      label="Brand"
                      placeholder="Select Brand"
                      data={brandOptions}
                      searchable
                      required
                      nothingFoundMessage="No brands found"
                      {...form.getInputProps("brand_id")}
                    />
                  ) : (
                    <TextInput
                      label="New Brand Name"
                      placeholder="e.g. BrewDog"
                      required
                      {...form.getInputProps("brand_name")}
                    />
                  )}
                  <Switch
                    label="New?"
                    style={{ flexGrow: 0, marginBottom: 8 }}
                    {...form.getInputProps("isNewBrand", { type: "checkbox" })}
                  />
                </Group>

                <Group align="end" grow>
                  {!form.values.isNewCountry ? (
                    <Select
                      label="Country"
                      placeholder="Select Country"
                      data={countryOptions}
                      searchable
                      required
                      nothingFoundMessage="No countries found"
                      {...form.getInputProps("country_id")}
                    />
                  ) : (
                    <TextInput
                      label="New Country Name"
                      placeholder="e.g. Scotland"
                      required
                      {...form.getInputProps("country_name")}
                    />
                  )}
                  <Switch
                    label="New?"
                    style={{ flexGrow: 0, marginBottom: 8 }}
                    {...form.getInputProps("isNewCountry", {
                      type: "checkbox",
                    })}
                  />
                </Group>
              </Stack>
            )}
          </Paper>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => navigate("/")}>
              Cancel
            </Button>
            <Button
              variant="light"
              loading={mutation.isPending}
              disabled={preparing}
              leftSection={<IconPlus size={16} />}
              onClick={() =>
                form.onSubmit((values) => handleSubmit(values, true))()
              }
            >
              Save & add another
            </Button>
            <Button
              type="submit"
              loading={mutation.isPending}
              disabled={preparing}
              leftSection={<IconCheck size={16} />}
            >
              Save Cap
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}
