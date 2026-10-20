import { Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import {
  IconArrowMerge,
  IconPencil,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAllCaps } from "../../api/beerCaps";
import {
  deleteBeer,
  getBeers,
  getBrands,
  getCountries,
  mergeBeer,
} from "../../api/references";
import { CapCircle, CapSocket } from "../../components/CapCircle";
import type { Beer } from "../../types";
import { confirmDelete } from "../../utils/confirm";
import { pluralCaps } from "../../utils/format";
import { notifySuccess } from "../../utils/notify";
import { collator, matchesWords } from "../../utils/search";
import { groupCapsByBeer } from "../AddCap/matching";
import { BeerPicker } from "../AddCap/pickers";
import { AdminList, AdminRow } from "./AdminList";
import { EditBeerForm } from "./editForms";
import { MergeModal } from "./MergeModal";

const EMPTY_THUMB = <CapSocket size={40} />;

export function BeersTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: beers = [] } = useQuery({
    queryKey: ["beers"],
    queryFn: getBeers,
  });
  const { data: caps = [] } = useQuery({
    queryKey: ["beerCaps"],
    queryFn: getAllCaps,
  });
  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });
  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  });
  const capsByBeer = useMemo(() => groupCapsByBeer(caps), [caps]);

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Beer | null>(null);
  const [merging, setMerging] = useState<Beer | null>(null);

  const sorted = useMemo(
    () => [...beers].sort((a, b) => collator.compare(a.name, b.name)),
    [beers],
  );
  const shown = sorted.filter((beer) =>
    matchesWords(
      [beer.name, beer.beer_brand?.name, beer.country?.name]
        .filter(Boolean)
        .join(" "),
      search,
    ),
  );

  const deleteMutation = useMutation({
    mutationFn: deleteBeer,
    onSuccess: () => {
      // Deleting a beer also deletes its caps.
      for (const key of ["beers", "beerCaps", "brands", "countries"]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      notifySuccess(t("admin.beers.deleted"));
    },
  });

  const capCount = (beer: Beer) =>
    capsByBeer.get(beer.id)?.length ?? beer.cap_count ?? 0;

  const askDelete = (beer: Beer) => {
    const count = capCount(beer);
    confirmDelete({
      title: t("admin.deleteQuestion", { name: beer.name }),
      message:
        count === 0
          ? t("common.cantUndo")
          : t("admin.beers.deleteWithCaps", { count }),
      onConfirm: () => deleteMutation.mutate(beer.id),
    });
  };

  const nameOf = (id: number) => beers.find((b) => b.id === id)?.name ?? "";

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="nowrap">
        <TextInput
          aria-label={t("admin.beers.searchLabel")}
          placeholder={t("admin.beers.searchPlaceholder")}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          style={{ flex: "1 1 auto", maxWidth: 420 }}
        />
        <Text size="sm" c="dimmed">
          {shown.length === beers.length
            ? t("common.beers", { count: beers.length })
            : t("admin.beers.filtered", {
                shown: shown.length,
                count: beers.length,
              })}
        </Text>
      </Group>

      {shown.length === 0 ? (
        <Text c="dimmed">{t("admin.beers.noMatch", { search })}</Text>
      ) : (
        <AdminList>
          {shown.map((beer) => {
            const newest = capsByBeer.get(beer.id)?.[0];
            const details = [
              beer.beer_brand?.name,
              beer.country?.name,
              beer.rating
                ? t("admin.beers.rated", { rating: beer.rating })
                : null,
            ]
              .filter(Boolean)
              .join(", ");
            return (
              <AdminRow
                key={beer.id}
                leading={
                  newest ? (
                    <CapCircle cap={newest} alt="" size={40} />
                  ) : (
                    EMPTY_THUMB
                  )
                }
                title={beer.name}
                details={details}
                meta={pluralCaps(capCount(beer))}
                actions={[
                  {
                    label: t("admin.editNamed", { name: beer.name }),
                    short: t("common.edit"),
                    icon: <IconPencil size={18} />,
                    onClick: () => setEditing(beer),
                  },
                  {
                    label: t("admin.beers.mergeLabel", { name: beer.name }),
                    short: t("admin.beers.mergeShort"),
                    icon: <IconArrowMerge size={18} />,
                    onClick: () => setMerging(beer),
                  },
                  {
                    label: t("admin.deleteNamed", { name: beer.name }),
                    short: t("common.delete"),
                    icon: <IconTrash size={18} />,
                    danger: true,
                    loading:
                      deleteMutation.isPending &&
                      deleteMutation.variables === beer.id,
                    onClick: () => askDelete(beer),
                  },
                ]}
              />
            );
          })}
        </AdminList>
      )}

      <Modal
        opened={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? t("admin.editNamed", { name: editing.name }) : ""}
      >
        {editing && (
          <EditBeerForm
            beer={editing}
            brands={brands}
            countries={countries}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>

      <MergeModal
        source={merging}
        onClose={() => setMerging(null)}
        title={
          merging ? t("admin.beers.mergeLabel", { name: merging.name }) : ""
        }
        explanation={
          merging &&
          t("admin.beers.mergeExplanation", {
            count: capCount(merging),
            name: merging.name,
          })
        }
        renderPicker={(value, onChange) => (
          <BeerPicker
            beers={beers.filter((beer) => beer.id !== merging?.id)}
            capsByBeer={capsByBeer}
            value={value}
            onChange={onChange}
            allowCreate={false}
          />
        )}
        nameOf={nameOf}
        merge={mergeBeer}
      />
    </Stack>
  );
}
