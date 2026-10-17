import { Button, Stack, Text, Title, VisuallyHidden } from "@mantine/core";
import { IconPlus, IconRefresh } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "../../admin/adminContext";
import { getAllCaps } from "../../api/beerCaps";
import { getErrorMessage } from "../../api/client";
import { CapGrid, CapTile, CapTileSkeleton } from "../../components/CapTile";
import { HeaderSlot } from "../../components/HeaderSlot";
import { pluralCaps } from "../../utils/format";
import {
  CapSearch,
  CountryChips,
  FilterMenus,
  PhoneFilterBar,
} from "./CapFilterBar";
import {
  type CapFilters,
  DEFAULT_FILTERS,
  facetOptions,
  filterAndSortCaps,
  groupCaps,
  hasActiveFilters,
  hasRatings,
} from "./capFilters";
import classes from "./DashboardPage.module.css";
import { useCapFilters } from "./useCapFilters";

const SKELETON_TILES = Array.from({ length: 16 }, (_, i) => i);

export function DashboardPage() {
  const { isAdmin } = useAdmin();
  const {
    data: caps,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["beerCaps"],
    queryFn: getAllCaps,
  });

  // Filters live in the URL, so refresh, back navigation and bookmarks keep them.
  const [filters, setFilters] = useCapFilters();
  const updateFilters = (changes: Partial<CapFilters>) =>
    setFilters({ ...filters, ...changes });
  const clearFilters = () =>
    setFilters({
      ...DEFAULT_FILTERS,
      sort: filters.sort,
      group: filters.group,
    });

  const allCaps = useMemo(() => caps ?? [], [caps]);
  const visibleCaps = useMemo(
    () => filterAndSortCaps(allCaps, filters),
    [allCaps, filters],
  );
  const groups = useMemo(
    () => groupCaps(visibleCaps, filters.group),
    [visibleCaps, filters.group],
  );
  // Previous/next on a cap's page follow the order shown here.
  const capIds = useMemo(
    () => groups.flatMap((group) => group.caps.map((cap) => cap.id)),
    [groups],
  );
  const countryOptions = useMemo(
    () => facetOptions(allCaps, "country"),
    [allCaps],
  );
  const brandOptions = useMemo(() => facetOptions(allCaps, "brand"), [allCaps]);
  const filtering = hasActiveFilters(filters);
  const filterProps = {
    filters,
    brandOptions,
    showRating: hasRatings(allCaps),
    onChange: updateFilters,
  };

  const heading = (
    <VisuallyHidden>
      <Title order={1}>Collection</Title>
    </VisuallyHidden>
  );

  if (isLoading) {
    return (
      <>
        {heading}
        <div className={classes.board}>
          <CapGrid>
            {SKELETON_TILES.map((i) => (
              <CapTileSkeleton key={i} />
            ))}
          </CapGrid>
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        {heading}
        <Stack align="flex-start" gap="sm" maw={480} mt="md">
          <Text fw={600}>The collection couldn't be loaded.</Text>
          <Text size="sm" c="dimmed">
            {getErrorMessage(error)}
          </Text>
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            loading={isRefetching}
            onClick={() => refetch()}
          >
            Try again
          </Button>
        </Stack>
      </>
    );
  }

  if (allCaps.length === 0) {
    return (
      <>
        {heading}
        <Stack align="flex-start" gap="sm" mt="md">
          <Text fw={600}>No caps yet.</Text>
          {isAdmin ? (
            <Button
              component={Link}
              to="/add"
              leftSection={<IconPlus size={16} />}
            >
              Add your first cap
            </Button>
          ) : (
            <Text c="dimmed">Caps appear here once they're added.</Text>
          )}
        </Stack>
      </>
    );
  }

  const countries = countryOptions.length;
  const summary = filtering
    ? `${visibleCaps.length} of ${pluralCaps(allCaps.length)}`
    : `${pluralCaps(allCaps.length)} from ${countries} ${countries === 1 ? "country" : "countries"}`;

  return (
    <div className={classes.page}>
      {heading}
      <HeaderSlot>
        <CapSearch
          value={filters.q}
          onChange={updateFilters}
          placeholder="Find a cap by beer, brand or country"
        />
      </HeaderSlot>

      <div className={classes.controls}>
        <div className={classes.summaryRow}>
          <p className={classes.summary} aria-live="polite">
            {summary}
          </p>
          {filtering && (
            <Button
              variant="subtle"
              color="gray"
              size="compact-sm"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          )}
          <FilterMenus {...filterProps} />
        </div>
        <CountryChips
          value={filters.countries}
          options={countryOptions}
          total={allCaps.length}
          onChange={updateFilters}
        />
      </div>

      {visibleCaps.length === 0 ? (
        <Stack align="flex-start" gap="sm" py="xl">
          <Text fw={600}>No caps match these filters.</Text>
          <Button variant="default" onClick={clearFilters}>
            Clear filters
          </Button>
        </Stack>
      ) : (
        <div className={classes.board}>
          {groups.map((group) => (
            <section
              key={group.key}
              aria-label={group.title || undefined}
              className={classes.group}
            >
              {group.title && (
                <div className={classes.plate}>
                  <Title order={2}>{group.title}</Title>
                  <span>{pluralCaps(group.caps.length)}</span>
                </div>
              )}
              <CapGrid>
                {group.caps.map((cap) => (
                  <CapTile key={cap.id} cap={cap} capIds={capIds} />
                ))}
              </CapGrid>
            </section>
          ))}
        </div>
      )}

      <PhoneFilterBar
        {...filterProps}
        isAdmin={isAdmin}
        shown={visibleCaps.length}
      />
    </div>
  );
}
