import { Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import {
  IconArrowMerge,
  IconPencil,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
      notifySuccess("Beer deleted.");
    },
  });

  const capCount = (beer: Beer) =>
    capsByBeer.get(beer.id)?.length ?? beer.cap_count ?? 0;

  const askDelete = (beer: Beer) => {
    const count = capCount(beer);
    confirmDelete({
      title: `Delete ${beer.name}?`,
      message:
        count === 0
          ? "This can't be undone."
          : count === 1
            ? "Its cap and the cap's photo are deleted too. This can't be undone."
            : `Its ${pluralCaps(count)} and their photos are deleted too. This can't be undone.`,
      onConfirm: () => deleteMutation.mutate(beer.id),
    });
  };

  const nameOf = (id: number) => beers.find((b) => b.id === id)?.name ?? "";

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="nowrap">
        <TextInput
          aria-label="Search beers"
          placeholder="Search beer, brand or country"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          style={{ flex: "1 1 auto", maxWidth: 420 }}
        />
        <Text size="sm" c="dimmed">
          {shown.length === beers.length
            ? `${beers.length} beers`
            : `${shown.length} of ${beers.length} beers`}
        </Text>
      </Group>

      {shown.length === 0 ? (
        <Text c="dimmed">No beers match “{search}”.</Text>
      ) : (
        <AdminList>
          {shown.map((beer) => {
            const newest = capsByBeer.get(beer.id)?.[0];
            const details = [
              beer.beer_brand?.name,
              beer.country?.name,
              beer.rating ? `rated ${beer.rating}/10` : null,
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
                    label: `Edit ${beer.name}`,
                    short: "Edit",
                    icon: <IconPencil size={18} />,
                    onClick: () => setEditing(beer),
                  },
                  {
                    label: `Merge ${beer.name} into another beer`,
                    short: "Merge into another beer",
                    icon: <IconArrowMerge size={18} />,
                    onClick: () => setMerging(beer),
                  },
                  {
                    label: `Delete ${beer.name}`,
                    short: "Delete",
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
        title={editing ? `Edit ${editing.name}` : ""}
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
        explanation={
          merging &&
          `Use this for a duplicate. ${
            capCount(merging) === 1
              ? "Its cap moves"
              : `Its ${pluralCaps(capCount(merging))} move`
          } to the beer you pick, then ${merging.name} is deleted. A country or rating the other beer lacks is taken over.`
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
        noun="beer"
        nameOf={nameOf}
        merge={mergeBeer}
      />
    </Stack>
  );
}
