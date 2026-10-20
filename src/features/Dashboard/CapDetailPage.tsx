import {
  ActionIcon,
  Anchor,
  Group,
  Stack,
  Text,
  Title,
  UnstyledButton,
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
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAdmin } from "../../admin/adminContext";
import { deleteCap, getAllCaps, getCapById } from "../../api/beerCaps";
import { CapCircle, CapSocket } from "../../components/CapCircle";
import { CapGrid, CapTile } from "../../components/CapTile";
import type { BeerCap } from "../../types";
import { confirmDelete } from "../../utils/confirm";
import { formatDate } from "../../utils/format";
import { getImageUrl } from "../../utils/imageUtils";
import { notifySuccess } from "../../utils/notify";
import classes from "./CapDetailPage.module.css";
import {
  type CapListState,
  capIdsFrom,
  capTransitionName,
  collectionPath,
} from "./capNavigation";
import { EditCapModal } from "./EditCapModal";

/** How many caps of the same brand to show before linking to them all. */
const MORE_FROM_BRAND = 10;

export function CapDetailPage() {
  const { t } = useTranslation();
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
      notifySuccess(t("cap.deleted"));
      navigate(backTo, { replace: true });
    },
  });

  const backLink = (
    <Link to={backTo} viewTransition className={classes.back}>
      <IconArrowLeft size={20} stroke={2.2} />
      {t("nav.collection")}
    </Link>
  );

  if (isLoading) {
    return (
      <Stack gap="lg">
        {backLink}
        <div className={classes.stage}>
          <div className={classes.capColumn}>
            <CapSocket deep transitionName={capTransitionName(id)} />
          </div>
        </div>
      </Stack>
    );
  }

  if (isError || !cap) {
    return (
      <Stack gap="sm" align="flex-start">
        {backLink}
        <Text fw={600}>{t("cap.notFound")}</Text>
        <Text c="dimmed">{t("cap.maybeDeleted")}</Text>
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
      title: t("cap.deleteTitle", { beer: beer.name }),
      message: t("cap.deleteMessage"),
      onConfirm: () => deleteMutation.mutate(cap.id),
    });
  };

  const hasNeighbours = index >= 0 && order.length > 1;
  const position = hasNeighbours && (
    <span className={classes.position}>
      {t("cap.position", { index: index + 1, total: order.length })}
    </span>
  );
  const stepButton = (direction: "previous" | "next", className: string) => {
    const target = direction === "previous" ? previousId : nextId;
    return (
      <ActionIcon
        variant="default"
        size={56}
        radius="xl"
        aria-label={
          direction === "previous" ? t("cap.previous") : t("cap.next")
        }
        disabled={target === undefined}
        onClick={() => goTo(target)}
        className={className}
      >
        {direction === "previous" ? (
          <IconChevronLeft size={24} stroke={2.4} />
        ) : (
          <IconChevronRight size={24} stroke={2.4} />
        )}
      </ActionIcon>
    );
  };

  return (
    <Stack gap="xl" className={classes.page}>
      <EditCapModal opened={editing} close={closeEdit} cap={cap} />

      <Group justify="space-between">
        {backLink}
        <span className={classes.widePosition}>{position}</span>
      </Group>

      <div className={classes.stage}>
        {hasNeighbours && stepButton("previous", classes.step)}
        <div className={classes.capColumn}>
          <CapCircle
            cap={cap}
            alt={beer.name}
            full
            deep
            transitionName={capTransitionName(cap.id)}
          />
          <Anchor
            href={getImageUrl(cap.presigned_url)}
            target="_blank"
            rel="noreferrer"
            size="sm"
            c="dimmed"
          >
            {t("cap.openOriginal")}
          </Anchor>
        </div>

        {/* The cap's details on a white tag, as in a museum case. */}
        <section className={classes.tag} aria-labelledby="cap-name">
          <span className={classes.eyelet} aria-hidden="true" />
          {brand && <p className={classes.brand}>{brand.name}</p>}
          <h1 id="cap-name" className={`${classes.name} display`}>
            {beer.name}
          </h1>
          {cap.variant_name && (
            <p className={classes.variant}>{cap.variant_name}</p>
          )}

          <dl className={classes.facts}>
            <dt>{t("cap.country")}</dt>
            <dd>{beer.country?.name ?? t("cap.notSet")}</dd>
            <dt>{t("cap.collected")}</dt>
            <dd>
              {cap.collected_date
                ? formatDate(cap.collected_date)
                : t("cap.notRecorded")}
            </dd>
            {!!beer.rating && (
              <>
                <dt>{t("cap.rating")}</dt>
                <dd>{beer.rating}/10</dd>
              </>
            )}
          </dl>

          {isAdmin && (
            <div className={classes.tagActions}>
              <UnstyledButton className={classes.edit} onClick={openEdit}>
                <IconPencil size={16} stroke={2.2} />
                {t("common.edit")}
              </UnstyledButton>
              <UnstyledButton
                className={classes.delete}
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
              >
                <IconTrash size={16} stroke={2.2} />
                {t("common.delete")}
              </UnstyledButton>
            </div>
          )}
        </section>
        {hasNeighbours && stepButton("next", classes.step)}
      </div>

      {sameBeer.length > 0 && (
        <RelatedCaps
          title={t("cap.otherCaps", { beer: beer.name })}
          caps={sameBeer}
        />
      )}
      {brand && sameBrand.length > 0 && (
        <RelatedCaps
          title={t("cap.moreFrom", { brand: brand.name })}
          caps={sameBrand.slice(0, MORE_FROM_BRAND)}
          link={
            sameBrand.length > MORE_FROM_BRAND && (
              <Anchor
                component={Link}
                to={`/?brand=${brand.id}`}
                size="sm"
                c="dimmed"
              >
                {t("cap.allFrom", {
                  count: sameBrand.length + sameBeer.length + 1,
                  brand: brand.name,
                })}
              </Anchor>
            )
          }
        />
      )}

      {hasNeighbours && (
        <div className={classes.phoneBar}>
          {stepButton("previous", "")}
          {position}
          {stepButton("next", "")}
        </div>
      )}
    </Stack>
  );
}

function RelatedCaps({
  title,
  caps,
  link,
}: {
  title: string;
  caps: BeerCap[];
  link?: ReactNode;
}) {
  const capIds = caps.map((c) => c.id);
  return (
    <section className={classes.related}>
      <div className={classes.relatedHead}>
        <Title order={2} fz="h3">
          {title}
        </Title>
        {link}
      </div>
      <CapGrid compact>
        {caps.map((c) => (
          <CapTile key={c.id} cap={c} capIds={capIds} />
        ))}
      </CapGrid>
    </section>
  );
}
