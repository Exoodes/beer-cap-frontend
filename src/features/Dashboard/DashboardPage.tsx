import { Button, Stack, Text, Title, VisuallyHidden } from "@mantine/core";
import { IconPlus, IconRefresh } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
  const noCountry = t("filters.noCountry");
  const noBrand = t("filters.noBrand");
  const groups = useMemo(
    () => groupCaps(visibleCaps, filters.group, { noCountry, noBrand }),
    [visibleCaps, filters.group, noCountry, noBrand],
  );
  // Previous/next on a cap's page follow the order shown here.
  const capIds = useMemo(
    () => groups.flatMap((group) => group.caps.map((cap) => cap.id)),
    [groups],
  );
  const countryOptions = useMemo(
    () => facetOptions(allCaps, "country", { noCountry, noBrand }),
    [allCaps, noCountry, noBrand],
  );
  const brandOptions = useMemo(
    () => facetOptions(allCaps, "brand", { noCountry, noBrand }),
    [allCaps, noCountry, noBrand],
  );
  const filtering = hasActiveFilters(filters);
  const filterProps = {
    filters,
    brandOptions,
    showRating: hasRatings(allCaps),
    onChange: updateFilters,
  };

  const heading = (
    <VisuallyHidden>
      <Title order={1}>{t("collection.title")}</Title>
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
          <Text fw={600}>{t("collection.loadFailed")}</Text>
          <Text size="sm" c="dimmed">
            {getErrorMessage(error)}
          </Text>
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            loading={isRefetching}
            onClick={() => refetch()}
          >
            {t("common.tryAgain")}
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
          <Text fw={600}>{t("collection.empty")}</Text>
          {isAdmin ? (
            <Button
              component={Link}
              to="/add"
              leftSection={<IconPlus size={16} />}
            >
              {t("collection.addFirst")}
            </Button>
          ) : (
            <Text c="dimmed">{t("collection.emptyVisitor")}</Text>
          )}
        </Stack>
      </>
    );
  }

  const countries = countryOptions.length;
  const summary = filtering
    ? t("collection.filtered", {
        shown: visibleCaps.length,
        count: allCaps.length,
      })
    : t("collection.summary", {
        caps: pluralCaps(allCaps.length),
        countries: t("common.countries", { count: countries }),
      });

  return (
    <div className={classes.page}>
      {heading}
      <HeaderSlot>
        <CapSearch
          value={filters.q}
          onChange={updateFilters}
          placeholder={t("collection.searchPlaceholder")}
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
              {t("collection.clearFilters")}
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
          <Text fw={600}>{t("collection.noMatch")}</Text>
          <Button variant="default" onClick={clearFilters}>
            {t("collection.clearFilters")}
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
