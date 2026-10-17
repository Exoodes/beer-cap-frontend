import {
  Button,
  Chip,
  CloseButton,
  Collapse,
  Group,
  MultiSelect,
  SegmentedControl,
  Select,
  Stack,
  Text,
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
import classes from "./CapFilterBar.module.css";
import {
  type CapFilters,
  type FacetOption,
  GROUP_OPTIONS,
  type GroupKey,
  RATING_OPTIONS,
  type RatingFilter,
  SORT_OPTIONS,
  type SortKey,
} from "./capFilters";

interface CapFilterBarProps {
  filters: CapFilters;
  countryOptions: FacetOption[];
  brandOptions: FacetOption[];
  /** Rating filter and sort only make sense once beers are rated. */
  showRating: boolean;
  onChange: (changes: Partial<CapFilters>) => void;
  onClear: () => void;
  canClear: boolean;
}

export function CapFilterBar({
  filters,
  countryOptions,
  brandOptions,
  showRating,
  onChange,
  onClear,
  canClear,
}: CapFilterBarProps) {
  const theme = useMantineTheme();
  const isWide = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`, true);
  const [moreOpen, { toggle: toggleMore }] = useDisclosure(false);

  const search = (
    <TextInput
      aria-label="Search"
      placeholder="Search beer, brewery, country or variant"
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
      // On wide screens the other controls share the row and wrap below
      // before the search box gets narrow.
      style={{ flex: "1 1 320px" }}
    />
  );

  // Countries as chips: one tap to filter, and the counts double as an
  // overview of the collection.
  const countries = (
    <Chip.Group
      multiple
      value={filters.countries}
      onChange={(countries) => onChange({ countries })}
    >
      <div className={isWide ? classes.chips : classes.chipsScroll}>
        {countryOptions.map((option) => (
          <Chip key={option.value} value={option.value} size="sm">
            {option.name} <span className={classes.count}>{option.count}</span>
          </Chip>
        ))}
      </div>
    </Chip.Group>
  );

  const sortOptions = SORT_OPTIONS.filter(
    (option) => showRating || option.value !== "rating",
  );

  const more = (
    <>
      <MultiSelect
        aria-label="Brewery"
        placeholder={filters.brands.length ? undefined : "Any brewery"}
        data={brandOptions}
        value={filters.brands}
        onChange={(brands) => onChange({ brands })}
        searchable
        filter={wordFilter}
        clearable
        hidePickedOptions
        nothingFoundMessage="No such brewery"
        w={isWide ? 240 : undefined}
      />
      {showRating && (
        <Select
          aria-label="Rating"
          placeholder="Any rating"
          data={RATING_OPTIONS}
          value={filters.rating}
          onChange={(rating) => onChange({ rating: rating as RatingFilter })}
          clearable
          w={isWide ? 140 : undefined}
        />
      )}
      <Select
        aria-label="Sort by"
        data={sortOptions}
        value={filters.sort}
        onChange={(sort) => sort && onChange({ sort: sort as SortKey })}
        allowDeselect={false}
        w={isWide ? 200 : undefined}
      />
      <Group gap="xs" wrap="nowrap">
        <Text size="sm" c="dimmed">
          Group
        </Text>
        <SegmentedControl
          size="sm"
          data={GROUP_OPTIONS.map((option) => ({ ...option }))}
          value={filters.group}
          onChange={(group) => onChange({ group: group as GroupKey })}
        />
      </Group>
    </>
  );

  const clear = canClear && (
    <Button
      variant="subtle"
      color="gray"
      c="dimmed"
      size="compact-sm"
      leftSection={<IconFilterOff size={16} />}
      onClick={onClear}
    >
      Clear filters
    </Button>
  );

  if (isWide) {
    return (
      <Stack gap="sm" mb="xl">
        <Group gap="sm">
          {search}
          {more}
        </Group>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          {countries}
          {clear}
        </Group>
      </Stack>
    );
  }

  return (
    <div className={classes.sticky}>
      <Stack gap="xs">
        {search}
        {countries}
        <Group justify="space-between">
          <Button
            variant="subtle"
            color="gray"
            c="dimmed"
            size="compact-sm"
            leftSection={<IconAdjustmentsHorizontal size={16} />}
            onClick={toggleMore}
            aria-expanded={moreOpen}
          >
            {moreOpen ? "Fewer options" : "Brewery, sorting, grouping"}
          </Button>
          {clear}
        </Group>
        <Collapse in={moreOpen}>
          <Stack gap="xs">{more}</Stack>
        </Collapse>
      </Stack>
    </div>
  );
}
