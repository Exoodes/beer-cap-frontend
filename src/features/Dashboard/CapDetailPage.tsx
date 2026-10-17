import {
  ActionIcon,
  Anchor,
  Button,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import {
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAdmin } from "../../admin/adminContext";
import { deleteCap, getAllCaps, getCapById } from "../../api/beerCaps";
import { CapCircle } from "../../components/CapCircle";
import { CapGrid, CapTile } from "../../components/CapTile";
import type { BeerCap } from "../../types";
import { confirmDelete } from "../../utils/confirm";
import { formatDate, pluralCaps } from "../../utils/format";
import { getImageUrl } from "../../utils/imageUtils";
import { notifySuccess } from "../../utils/notify";
import classes from "./CapDetailPage.module.css";
import { type CapListState, capIdsFrom, collectionPath } from "./capNavigation";
import { EditCapModal } from "./EditCapModal";

/** How many caps of the same brewery to show before linking to them all. */
const MORE_FROM_BREWERY = 10;

export function CapDetailPage() {
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAdmin();
  const [editing, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  const {
    data: cap,
    isLoading,
    isError,
  } = useQuery({
    // Numeric id, matching the key EditCapModal invalidates.
    queryKey: ["beerCap", id],
    queryFn: () => getCapById(id),
    enabled: Number.isInteger(id) && id > 0,
  });
  const { data: caps = [] } = useQuery({
    queryKey: ["beerCaps"],
    queryFn: getAllCaps,
  });

  // Previous/next follow the list the cap was opened from; opened directly,
  // they follow the collection's default order (newest first).
  const order = useMemo(
    () =>
      capIdsFrom(location.state) ?? caps.map((c) => c.id).sort((a, b) => b - a),
    [location.state, caps],
  );
  const index = order.indexOf(id);
  const previousId = index > 0 ? order[index - 1] : undefined;
  const nextId = index >= 0 ? order[index + 1] : undefined;
  const goTo = (target: number | undefined) => {
    if (target === undefined) return;
    const state: CapListState = { capIds: order };
    // Replace, so Back returns to the collection, not through every cap.
    navigate(`/cap/${target}`, { state, replace: true });
  };
  useHotkeys([
    ["ArrowLeft", () => goTo(previousId)],
    ["ArrowRight", () => goTo(nextId)],
  ]);

  const backTo = collectionPath();

  const deleteMutation = useMutation({
    mutationFn: deleteCap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beerCaps"] });
      queryClient.invalidateQueries({ queryKey: ["beers"] });
      notifySuccess("Cap deleted.");
      navigate(backTo, { replace: true });
    },
  });

  const backLink = (
    <Anchor component={Link} to={backTo} className={classes.back}>
      <IconArrowLeft size={16} />
      Back to collection
    </Anchor>
  );

  if (isLoading) {
    return (
      <Stack gap="lg">
        {backLink}
        <div className={classes.layout}>
          <Skeleton circle className={classes.skeleton} />
          <Stack>
            <Skeleton height={16} width="30%" />
            <Skeleton height={40} width="70%" />
          </Stack>
        </div>
      </Stack>
    );
  }

  if (isError || !cap) {
    return (
      <Stack gap="sm" align="flex-start">
        {backLink}
        <Text fw={600}>This cap isn't in the collection.</Text>
        <Text c="dimmed">It may have been deleted.</Text>
      </Stack>
    );
  }

  const { beer } = cap;
  const brand = beer.beer_brand;
  const sameBeer = caps.filter((c) => c.beer.id === beer.id && c.id !== cap.id);
  const sameBrand = brand
    ? caps
        .filter(
          (c) => c.beer.beer_brand?.id === brand.id && c.beer.id !== beer.id,
        )
        .sort((a, b) => b.id - a.id)
    : [];

  const handleDelete = () => {
    confirmDelete({
      title: `Delete this ${beer.name} cap?`,
      message: "Its photo is deleted too. This can't be undone.",
      onConfirm: () => deleteMutation.mutate(cap.id),
    });
  };

  return (
    <Stack gap="xl" pb="xl">
      <EditCapModal opened={editing} close={closeEdit} cap={cap} />

      <Group justify="space-between">
        {backLink}
        {index >= 0 && order.length > 1 && (
          <Group gap="xs">
            <ActionIcon
              variant="default"
              size="lg"
              aria-label="Previous cap"
              disabled={previousId === undefined}
              onClick={() => goTo(previousId)}
            >
              <IconChevronLeft size={18} />
            </ActionIcon>
            <Text size="sm" c="dimmed" className={classes.position}>
              {index + 1} of {order.length}
            </Text>
            <ActionIcon
              variant="default"
              size="lg"
              aria-label="Next cap"
              disabled={nextId === undefined}
              onClick={() => goTo(nextId)}
            >
              <IconChevronRight size={18} />
            </ActionIcon>
          </Group>
        )}
      </Group>

      <div className={classes.layout}>
        <Stack gap="xs" align="center">
          <CapCircle cap={cap} alt={beer.name} full />
          <Anchor
            href={getImageUrl(cap.presigned_url)}
            target="_blank"
            rel="noreferrer"
            size="sm"
          >
            Open the original photo
          </Anchor>
        </Stack>

        <Stack gap="md">
          <div>
            {brand && (
              <Text fw={600} c="dimmed">
                {brand.name}
              </Text>
            )}
            <Title order={1}>{beer.name}</Title>
            {cap.variant_name && (
              <Text size="lg" mt={4}>
                {cap.variant_name}
              </Text>
            )}
          </div>

          <dl className={classes.facts}>
            <dt>Country</dt>
            <dd>{beer.country?.name ?? "Not set"}</dd>
            <dt>Collected</dt>
            <dd>
              {cap.collected_date
                ? formatDate(cap.collected_date)
                : "Not recorded"}
            </dd>
            {!!beer.rating && (
              <>
                <dt>Rating</dt>
                <dd>{beer.rating}/10</dd>
              </>
            )}
          </dl>

          {isAdmin && (
            <Group gap="sm">
              <Button
                variant="default"
                leftSection={<IconPencil size={16} />}
                onClick={openEdit}
              >
                Edit
              </Button>
              <Button
                variant="subtle"
                color="red"
                leftSection={<IconTrash size={16} />}
                loading={deleteMutation.isPending}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </Group>
          )}
        </Stack>
      </div>

      {sameBeer.length > 0 && (
        <RelatedCaps title={`Other caps of ${beer.name}`} caps={sameBeer} />
      )}
      {brand && sameBrand.length > 0 && (
        <RelatedCaps
          title={`More from ${brand.name}`}
          caps={sameBrand.slice(0, MORE_FROM_BREWERY)}
          footer={
            sameBrand.length > MORE_FROM_BREWERY && (
              <Anchor component={Link} to={`/?brand=${brand.id}`} size="sm">
                All {pluralCaps(sameBrand.length + sameBeer.length + 1)} from{" "}
                {brand.name}
              </Anchor>
            )
          }
        />
      )}
    </Stack>
  );
}

function RelatedCaps({
  title,
  caps,
  footer,
}: {
  title: string;
  caps: BeerCap[];
  footer?: ReactNode;
}) {
  const capIds = caps.map((c) => c.id);
  return (
    <section>
      <Title order={2} fz="h3" mb="sm">
        {title}
      </Title>
      <CapGrid compact>
        {caps.map((c) => (
          <CapTile key={c.id} cap={c} capIds={capIds} />
        ))}
      </CapGrid>
      {footer && <div className={classes.footer}>{footer}</div>}
    </section>
  );
}
