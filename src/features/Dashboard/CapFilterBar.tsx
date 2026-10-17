import {
  ActionIcon,
  Button,
  CloseButton,
  Drawer,
  Indicator,
  Menu,
  MultiSelect,
  Popover,
  SegmentedControl,
  Select,
  Stack,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAdjustmentsHorizontal,
  IconCheck,
  IconChevronDown,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { pluralCaps } from "../../utils/format";
import { wordFilter } from "../../utils/search";
import classes from "./CapFilterBar.module.css";
import {
  type CapFilters,
  type FacetOption,
  type GroupKey,
  RATING_OPTIONS,
  type RatingFilter,
  SORT_OPTIONS,
  type SortKey,
} from "./capFilters";

type Change = (changes: Partial<CapFilters>) => void;

const GROUP_LABELS = [
  { value: "none", label: "None" },
  { value: "country", label: "By country" },
  { value: "brand", label: "By brand" },
] as const;

const ANY_RATING = [{ value: "any", label: "Any" }, ...RATING_OPTIONS] as const;

/** Rating filter and sort only make sense once beers are rated. */
const sortOptions = (showRating: boolean) =>
  SORT_OPTIONS.filter((option) => showRating || option.value !== "rating");

interface SearchProps {
  value: string;
  onChange: Change;
  placeholder: string;
}

/** The search box: in the header on wide screens, the bottom bar on phones. */
export function CapSearch({ value, onChange, placeholder }: SearchProps) {
  return (
    <TextInput
      type="search"
      aria-label="Search"
      placeholder={placeholder}
      size="lg"
      radius="xl"
      leftSection={<IconSearch size={20} />}
      value={value}
      onChange={(e) => onChange({ q: e.currentTarget.value })}
      rightSection={
        value ? (
          <CloseButton
            aria-label="Clear search"
            onClick={() => onChange({ q: "" })}
          />
        ) : null
      }
      className={classes.search}
    />
  );
}

interface CountryChipsProps {
  value: string[];
  options: FacetOption[];
  total: number;
  onChange: Change;
}

/** One tap filters by a country; the counts double as an overview. */
export function CountryChips({
  value,
  options,
  total,
  onChange,
}: CountryChipsProps) {
  const toggle = (country: string) =>
    onChange({
      countries: value.includes(country)
        ? value.filter((c) => c !== country)
        : [...value, country],
    });
  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset can't scroll sideways as a flex row
    <div role="group" aria-label="Country" className={classes.chips}>
      <button
        type="button"
        className={classes.chip}
        aria-pressed={value.length === 0}
        onClick={() => onChange({ countries: [] })}
      >
        All <span className={classes.count}>{total}</span>
      </button>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={classes.chip}
          aria-pressed={value.includes(option.value)}
          onClick={() => toggle(option.value)}
        >
          {option.name} <span className={classes.count}>{option.count}</span>
        </button>
      ))}
    </div>
  );
}

interface QuietMenuProps<T extends string> {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** "Sort Recently added": a label, the current choice and a menu. */
function QuietMenu<T extends string>({
  label,
  value,
  options,
  onChange,
}: QuietMenuProps<T>) {
  return (
    <Menu position="bottom-end">
      <Menu.Target>
        <UnstyledButton className={classes.quiet}>
          <span className={classes.quietLabel}>{label}</span>
          {options.find((option) => option.value === value)?.label}
          <IconChevronDown size={14} stroke={2.5} />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        {options.map((option) => (
          <Menu.Item
            key={option.value}
            leftSection={
              <IconCheck
                size={16}
                visibility={option.value === value ? "visible" : "hidden"}
              />
            }
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

interface FilterProps {
  filters: CapFilters;
  brandOptions: FacetOption[];
  showRating: boolean;
  onChange: Change;
}

function brandSummary(brands: string[], options: FacetOption[]): string {
  if (brands.length === 0) return "Any";
  const first = options.find((o) => o.value === brands[0])?.name ?? "1 brand";
  return brands.length === 1 ? first : `${first} +${brands.length - 1}`;
}

function BrandSelect({ filters, brandOptions, onChange }: FilterProps) {
  return (
    <MultiSelect
      label="Brand"
      placeholder={filters.brands.length ? undefined : "Any brand"}
      data={brandOptions}
      value={filters.brands}
      onChange={(brands) => onChange({ brands })}
      searchable
      filter={wordFilter}
      clearable
      hidePickedOptions
      nothingFoundMessage="No such brand"
      comboboxProps={{ withinPortal: false }}
    />
  );
}

/** Wide screens: brand, rating, sort and grouping as quiet menus. */
export function FilterMenus(props: FilterProps) {
  const { filters, brandOptions, showRating, onChange } = props;
  return (
    <div className={classes.menus}>
      <QuietMenu
        label="Sort"
        value={filters.sort}
        options={sortOptions(showRating)}
        onChange={(sort: SortKey) => onChange({ sort })}
      />
      <QuietMenu
        label="Group"
        value={filters.group}
        options={GROUP_LABELS}
        onChange={(group: GroupKey) => onChange({ group })}
      />
      {showRating && (
        <QuietMenu
          label="Rating"
          value={filters.rating ?? "any"}
          options={ANY_RATING}
          onChange={(rating) =>
            onChange({
              rating: rating === "any" ? null : (rating as RatingFilter),
            })
          }
        />
      )}
      <Popover position="bottom-end" width={300} trapFocus>
        <Popover.Target>
          <UnstyledButton className={classes.quiet}>
            <span className={classes.quietLabel}>Brand</span>
            {brandSummary(filters.brands, brandOptions)}
            <IconChevronDown size={14} stroke={2.5} />
          </UnstyledButton>
        </Popover.Target>
        <Popover.Dropdown>
          <BrandSelect {...props} />
        </Popover.Dropdown>
      </Popover>
    </div>
  );
}

/**
 * Phones: search, the other filters and adding a cap, in one bar at the
 * bottom of the screen within thumb reach.
 */
export function PhoneFilterBar({
  isAdmin,
  shown,
  ...props
}: FilterProps & { isAdmin: boolean; shown: number }) {
  const { filters, showRating, onChange } = props;
  const [opened, { open, close }] = useDisclosure(false);
  const narrowed = filters.brands.length > 0 || filters.rating !== null;

  return (
    <div className={classes.phoneBar}>
      <CapSearch
        value={filters.q}
        onChange={onChange}
        placeholder="Find a cap"
      />
      <Indicator disabled={!narrowed} size={10} offset={6}>
        <ActionIcon
          variant="default"
          size={52}
          radius="xl"
          aria-label="Brand, sorting and grouping"
          onClick={open}
        >
          <IconAdjustmentsHorizontal size={22} />
        </ActionIcon>
      </Indicator>
      {isAdmin && (
        <ActionIcon
          component={Link}
          to="/add"
          size={52}
          radius="xl"
          aria-label="Add a cap"
          className={classes.add}
        >
          <IconPlus size={24} stroke={2.5} />
        </ActionIcon>
      )}

      <Drawer
        opened={opened}
        onClose={close}
        position="bottom"
        classNames={{ content: classes.sheet }}
        title={<span className="display">Brand, sorting, grouping</span>}
      >
        <Stack gap="md" pb="md">
          <BrandSelect {...props} />
          {showRating && (
            <Select
              label="Rating"
              placeholder="Any rating"
              data={RATING_OPTIONS}
              value={filters.rating}
              onChange={(rating) =>
                onChange({ rating: rating as RatingFilter })
              }
              clearable
              comboboxProps={{ withinPortal: false }}
            />
          )}
          <Select
            label="Sort"
            data={sortOptions(showRating)}
            value={filters.sort}
            onChange={(sort) => sort && onChange({ sort: sort as SortKey })}
            allowDeselect={false}
            comboboxProps={{ withinPortal: false }}
          />
          <Stack gap={4}>
            <span className={classes.fieldLabel}>Group</span>
            <SegmentedControl
              fullWidth
              data={GROUP_LABELS.map((option) => ({ ...option }))}
              value={filters.group}
              onChange={(group) => onChange({ group: group as GroupKey })}
            />
          </Stack>
          <Button size="md" onClick={close}>
            Show {pluralCaps(shown)}
          </Button>
        </Stack>
      </Drawer>
    </div>
  );
}
