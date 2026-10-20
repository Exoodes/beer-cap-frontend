import {
  Button,
  NumberInput,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { updateBeer } from "../../api/beerCaps";
import { updateBrand, updateCountry } from "../../api/references";
import type { Beer, BeerBrandWithBeers, CountryWithBeers } from "../../types";
import { notifySuccess } from "../../utils/notify";
import { wordFilter } from "../../utils/search";

// The edit forms mount when their modal opens, so they start from the
// current values without syncing state in an effect.

export function EditBeerForm({
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const form = useForm({
    initialValues: {
      name: beer.name,
      rating: beer.rating ?? 0,
      beer_brand_id: beer.beer_brand?.id.toString() ?? null,
      country_id: beer.country?.id.toString() ?? null,
    },
    validate: {
      name: (v) => (v.trim() ? null : t("common.required")),
      beer_brand_id: (v) => (v ? null : t("admin.form.selectBrand")),
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
      // Prefix match: every open cap page shows the new name.
      queryClient.invalidateQueries({ queryKey: ["beerCap"] });
      notifySuccess(t("admin.form.beerUpdated"));
      onDone();
    },
  });

  return (
    <form onSubmit={form.onSubmit((v) => mutation.mutate(v))}>
      <Stack>
        <TextInput label={t("common.name")} {...form.getInputProps("name")} />
        <NumberInput
          label={t("admin.form.rating")}
          min={0}
          max={10}
          {...form.getInputProps("rating")}
        />
        <Select
          label={t("admin.form.brand")}
          placeholder={t("admin.form.pickBrand")}
          data={brands.map((b) => ({ value: b.id.toString(), label: b.name }))}
          searchable
          filter={wordFilter}
          {...form.getInputProps("beer_brand_id")}
        />
        <Select
          label={t("admin.form.country")}
          placeholder={t("admin.form.noCountry")}
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
          {t("common.save")}
        </Button>
      </Stack>
    </form>
  );
}

export function EditBrandForm({
  brand,
  onDone,
}: {
  brand: BeerBrandWithBeers;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const form = useForm({
    initialValues: { name: brand.name },
    validate: { name: (v) => (v.trim() ? null : t("common.required")) },
  });

  const mutation = useMutation({
    mutationFn: (v: typeof form.values) =>
      updateBrand(brand.id, { name: v.name.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["beers"] });
      queryClient.invalidateQueries({ queryKey: ["beerCaps"] });
      // Prefix match: every open cap page shows the new name.
      queryClient.invalidateQueries({ queryKey: ["beerCap"] });
      notifySuccess(t("admin.form.brandUpdated"));
      onDone();
    },
  });

  return (
    <form onSubmit={form.onSubmit((v) => mutation.mutate(v))}>
      <Stack>
        <TextInput label={t("common.name")} {...form.getInputProps("name")} />
        <Button type="submit" loading={mutation.isPending}>
          {t("common.save")}
        </Button>
      </Stack>
    </form>
  );
}

export function EditCountryForm({
  country,
  onDone,
}: {
  country: CountryWithBeers;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const form = useForm({
    initialValues: {
      name: country.name,
      description: country.description ?? "",
    },
    validate: { name: (v) => (v.trim() ? null : t("common.required")) },
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
      // Prefix match: every open cap page shows the new name.
      queryClient.invalidateQueries({ queryKey: ["beerCap"] });
      notifySuccess(t("admin.form.countryUpdated"));
      onDone();
    },
  });

  return (
    <form onSubmit={form.onSubmit((v) => mutation.mutate(v))}>
      <Stack>
        <TextInput label={t("common.name")} {...form.getInputProps("name")} />
        <Textarea
          label={t("admin.form.description")}
          {...form.getInputProps("description")}
        />
        <Button type="submit" loading={mutation.isPending}>
          {t("common.save")}
        </Button>
      </Stack>
    </form>
  );
}
