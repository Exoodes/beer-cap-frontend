import {
  Badge,
  Button,
  CloseButton,
  Collapse,
  Grid,
  MultiSelect,
  Paper,
  Select,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconAdjustmentsHorizontal,
  IconFilterOff,
  IconSearch,
} from "@tabler/icons-react";
import { wordFilter } from "../../utils/search";
import {
  type CapFilters,
  type FacetOption,
  RATING_OPTIONS,
  type RatingFilter,
  SORT_OPTIONS,
  type SortKey,
} from "./capFilters";

interface CapFilterBarProps {
  filters: CapFilters;
  countryOptions: FacetOption[];
  brandOptions: FacetOption[];
  onChange: (changes: Partial<CapFilters>) => void;
  onClear: () => void;
  canClear: boolean;
}

export function CapFilterBar({
  filters,
  countryOptions,
  brandOptions,
  onChange,
  onClear,
  canClear,
}: CapFilterBarProps) {
  const theme = useMantineTheme();
  const isWide = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`, true);
  // On phones only the search box shows until "Filters" is tapped.
  const [filtersOpen, { toggle }] = useDisclosure(false);
  const activeCount =
    (filters.countries.length > 0 ? 1 : 0) +
    (filters.brands.length > 0 ? 1 : 0) +
    (filters.rating ? 1 : 0);

  const search = (
    <TextInput
      label="Search"
      placeholder="Beer, brand, country or variant"
      leftSection={<IconSearch size={16} />}
      value={filters.q}
      onChange={(e) => onChange({ q: e.currentTarget.value })}
      rightSection={
        filters.q ? (
          <CloseButton
            size="sm"
            aria-label="Clear search"
            onClick={() => onChange({ q: "" })}
          />
        ) : null
      }
    />
  );

  const otherFilters = (
    <>
      <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
        <MultiSelect
          label="Country"
          placeholder={filters.countries.length ? undefined : "All"}
          data={countryOptions}
          value={filters.countries}
          onChange={(countries) => onChange({ countries })}
          searchable
          filter={wordFilter}
          clearable
          hidePickedOptions
          nothingFoundMessage="No such country"
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
        <MultiSelect
          label="Brand"
          placeholder={filters.brands.length ? undefined : "All"}
          data={brandOptions}
          value={filters.brands}
          onChange={(brands) => onChange({ brands })}
          searchable
          filter={wordFilter}
          clearable
          hidePickedOptions
          nothingFoundMessage="No such brand"
        />
      </Grid.Col>
      <Grid.Col span={{ base: 6, sm: 4, md: 1 }}>
        <Select
          label="Rating"
          placeholder="Any"
          data={RATING_OPTIONS}
          value={filters.rating}
          onChange={(rating) => onChange({ rating: rating as RatingFilter })}
          clearable
        />
      </Grid.Col>
      <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
        <Select
          label="Sort by"
          data={SORT_OPTIONS}
          value={filters.sort}
          onChange={(sort) => sort && onChange({ sort: sort as SortKey })}
          allowDeselect={false}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 4, md: 2 }}>
        <Button
          variant="subtle"
          fullWidth
          leftSection={<IconFilterOff size={16} />}
          onClick={onClear}
          disabled={!canClear}
        >
          Clear filters
        </Button>
      </Grid.Col>
    </>
  );

  if (isWide) {
    return (
      <Paper withBorder p="md" radius="md" mb="lg">
        <Grid gutter="sm" align="flex-end">
          <Grid.Col span={{ base: 12, md: 3 }}>{search}</Grid.Col>
          {otherFilters}
        </Grid>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="sm" radius="md" mb="lg">
      {search}
      <Button
        variant="subtle"
        size="compact-sm"
        mt="xs"
        leftSection={<IconAdjustmentsHorizontal size={16} />}
        rightSection={
          activeCount > 0 ? (
            <Badge size="sm" circle>
              {activeCount}
            </Badge>
          ) : null
        }
        onClick={toggle}
        aria-expanded={filtersOpen}
      >
        {filtersOpen ? "Hide filters" : "Filters & sorting"}
      </Button>
      <Collapse in={filtersOpen}>
        <Grid gutter="sm" align="flex-end" mt="xs">
          {otherFilters}
        </Grid>
      </Collapse>
    </Paper>
  );
}
