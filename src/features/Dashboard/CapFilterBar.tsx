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
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { pluralCaps } from "../../utils/format";
import { wordFilter } from "../../utils/search";
import classes from "./CapFilterBar.module.css";
import {
  type CapFilters,
  type FacetOption,
  GROUP_KEYS,
  type GroupKey,
  RATING_FILTERS,
  type RatingFilter,
  SORT_KEYS,
  type SortKey,
} from "./capFilters";

type Change = (changes: Partial<CapFilters>) => void;

/** The options of each filter, labelled in the UI's language. */
function useFilterOptions() {
  const { t } = useTranslation();
  return {
    /** Rating filter and sort only make sense once beers are rated. */
    sort: (showRating: boolean) =>
      SORT_KEYS.filter((key) => showRating || key !== "rating").map((key) => ({
        value: key,
        label: t(`filters.sortBy.${key}`),
      })),
    group: GROUP_KEYS.map((key) => ({
      value: key,
      label: t(`filters.groupBy.${key}`),
    })),
    rating: RATING_FILTERS.map((key) => ({
      value: key,
      label: key === "unrated" ? t("filters.unrated") : `${key}+`,
    })),
  };
}

interface SearchProps {
  value: string;
  onChange: Change;
  placeholder: string;
}

/** The search box: in the header on wide screens, the bottom bar on phones. */
export function CapSearch({ value, onChange, placeholder }: SearchProps) {
  const { t } = useTranslation();
  return (
    <TextInput
      type="search"
      aria-label={t("filters.searchLabel")}
      placeholder={placeholder}
      size="lg"
      radius="xl"
      leftSection={<IconSearch size={20} />}
      value={value}
      onChange={(e) => onChange({ q: e.currentTarget.value })}
      rightSection={
        value ? (
          <CloseButton
            aria-label={t("filters.clearSearch")}
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
  const { t } = useTranslation();
  const toggle = (country: string) =>
    onChange({
      countries: value.includes(country)
        ? value.filter((c) => c !== country)
        : [...value, country],
    });
  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset can't scroll sideways as a flex row
    <div
      role="group"
      aria-label={t("filters.country")}
      className={classes.chips}
    >
      <button
        type="button"
        className={classes.chip}
        aria-pressed={value.length === 0}
        onClick={() => onChange({ countries: [] })}
      >
        {t("filters.all")} <span className={classes.count}>{total}</span>
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

function BrandSummary({
  brands,
  options,
}: {
  brands: string[];
  options: FacetOption[];
}) {
  const { t } = useTranslation();
  if (brands.length === 0) return t("filters.any");
  const first =
    options.find((o) => o.value === brands[0])?.name ?? t("filters.oneBrand");
  return brands.length === 1 ? first : `${first} +${brands.length - 1}`;
}

function BrandSelect({ filters, brandOptions, onChange }: FilterProps) {
  const { t } = useTranslation();
  return (
    <MultiSelect
      label={t("filters.brand")}
      placeholder={filters.brands.length ? undefined : t("filters.anyBrand")}
      data={brandOptions}
      value={filters.brands}
      onChange={(brands) => onChange({ brands })}
      searchable
      filter={wordFilter}
      clearable
      hidePickedOptions
      nothingFoundMessage={t("filters.noSuchBrand")}
      comboboxProps={{ withinPortal: false }}
    />
  );
}

/** Wide screens: brand, rating, sort and grouping as quiet menus. */
export function FilterMenus(props: FilterProps) {
  const { filters, brandOptions, showRating, onChange } = props;
  const { t } = useTranslation();
  const options = useFilterOptions();
  return (
    <div className={classes.menus}>
      <QuietMenu
        label={t("filters.sort")}
        value={filters.sort}
        options={options.sort(showRating)}
        onChange={(sort: SortKey) => onChange({ sort })}
      />
      <QuietMenu
        label={t("filters.group")}
        value={filters.group}
        options={options.group}
        onChange={(group: GroupKey) => onChange({ group })}
      />
      {showRating && (
        <QuietMenu<string>
          label={t("filters.rating")}
          value={filters.rating ?? "any"}
          options={[
            { value: "any", label: t("filters.any") },
            ...options.rating,
          ]}
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
            <span className={classes.quietLabel}>{t("filters.brand")}</span>
            <BrandSummary brands={filters.brands} options={brandOptions} />
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
  const { t } = useTranslation();
  const options = useFilterOptions();
  const [opened, { open, close }] = useDisclosure(false);
  const narrowed = filters.brands.length > 0 || filters.rating !== null;

  return (
    <div className={classes.phoneBar}>
      <CapSearch
        value={filters.q}
        onChange={onChange}
        placeholder={t("collection.searchPlaceholderShort")}
      />
      <Indicator disabled={!narrowed} size={10} offset={6}>
        <ActionIcon
          variant="default"
          size={52}
          radius="xl"
          aria-label={t("filters.more")}
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
          aria-label={t("filters.addCap")}
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
        title={<span className="display">{t("filters.moreTitle")}</span>}
      >
        <Stack gap="md" pb="md">
          <BrandSelect {...props} />
          {showRating && (
            <Select
              label={t("filters.rating")}
              placeholder={t("filters.anyRating")}
              data={options.rating}
              value={filters.rating}
              onChange={(rating) =>
                onChange({ rating: rating as RatingFilter })
              }
              clearable
              comboboxProps={{ withinPortal: false }}
            />
          )}
          <Select
            label={t("filters.sort")}
            data={options.sort(showRating)}
            value={filters.sort}
            onChange={(sort) => sort && onChange({ sort: sort as SortKey })}
            allowDeselect={false}
            comboboxProps={{ withinPortal: false }}
          />
          <Stack gap={4}>
            <span className={classes.fieldLabel}>{t("filters.group")}</span>
            <SegmentedControl
              fullWidth
              data={options.group}
              value={filters.group}
              onChange={(group) => onChange({ group: group as GroupKey })}
            />
          </Stack>
          <Button size="md" onClick={close}>
            {t("filters.show", { caps: pluralCaps(shown) })}
          </Button>
        </Stack>
      </Drawer>
    </div>
  );
}
