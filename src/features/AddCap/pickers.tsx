import { Group, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";
import { CapCircle } from "../../components/CapCircle";
import { type Choice, CreatablePicker } from "../../components/CreatablePicker";
import type {
  Beer,
  BeerBrandWithBeers,
  BeerCap,
  CountryWithBeers,
} from "../../types";
import { pluralCaps } from "../../utils/format";
import { beerLabel } from "../../utils/search";

interface PickerProps {
  value: Choice | null;
  onChange: (choice: Choice) => void;
  error?: ReactNode;
  allowCreate?: boolean;
}

function EmptyCircle({ size }: { size: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "1px dashed var(--line)",
        flex: "none",
      }}
    />
  );
}

/** Beers with their newest cap, brand, country and how many caps you have. */
export function BeerPicker({
  beers,
  capsByBeer,
  ...props
}: PickerProps & { beers: Beer[]; capsByBeer: Map<number, BeerCap[]> }) {
  const items = beers.map((beer) => ({
    id: beer.id,
    name: beer.name,
    searchText: [beer.name, beer.beer_brand?.name, beer.country?.name]
      .filter(Boolean)
      .join(" "),
    beer,
  }));

  return (
    <CreatablePicker
      {...props}
      label="Beer"
      placeholder="Type the name on the cap"
      items={items}
      // The same name can exist under another brand.
      createWhenExact
      createLabel={(name) => (
        <Text size="sm" fw={600}>
          + Add “{name}” as a new beer
        </Text>
      )}
      renderOption={({ beer }) => {
        const caps = capsByBeer.get(beer.id) ?? [];
        const details = [beer.beer_brand?.name, beer.country?.name]
          .filter(Boolean)
          .join(", ");
        return (
          <Group gap="sm" wrap="nowrap">
            {caps[0] ? (
              <CapCircle cap={caps[0]} alt="" size={40} />
            ) : (
              <EmptyCircle size={40} />
            )}
            <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={600} truncate>
                {beerLabel(beer.name, beer.beer_brand?.name)}
              </Text>
              {details && (
                <Text size="xs" c="dimmed" truncate>
                  {details}
                </Text>
              )}
            </Stack>
            <Text size="xs" c="dimmed" style={{ flex: "none" }}>
              {pluralCaps(caps.length)}
            </Text>
          </Group>
        );
      }}
    />
  );
}

function NamedCountOption({ name, count }: { name: string; count?: number }) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Text size="sm" truncate>
        {name}
      </Text>
      {count !== undefined && (
        <Text size="xs" c="dimmed" style={{ flex: "none" }}>
          {count === 1 ? "1 beer" : `${count} beers`}
        </Text>
      )}
    </Group>
  );
}

export function BrandPicker({
  brands,
  ...props
}: PickerProps & { brands: BeerBrandWithBeers[] }) {
  return (
    <CreatablePicker
      {...props}
      label="Brand"
      placeholder="The brand on the cap"
      items={brands}
      createLabel={(name) => (
        <Text size="sm" fw={600}>
          + Add “{name}” as a new brand
        </Text>
      )}
      renderOption={(brand) => (
        <NamedCountOption
          name={brand.name}
          count={brand.beer_count ?? undefined}
        />
      )}
    />
  );
}

export function CountryPicker({
  countries,
  ...props
}: PickerProps & { countries: CountryWithBeers[] }) {
  return (
    <CreatablePicker
      {...props}
      label="Country"
      placeholder="Where it's brewed"
      items={countries}
      createLabel={(name) => (
        <Text size="sm" fw={600}>
          + Add “{name}” as a new country
        </Text>
      )}
      renderOption={(country) => (
        <NamedCountOption
          name={country.name}
          count={country.beer_count ?? undefined}
        />
      )}
    />
  );
}
