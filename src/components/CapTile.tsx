import { Skeleton } from "@mantine/core";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { CapListState } from "../features/Dashboard/capNavigation";
import type { BeerCap } from "../types";
import { CapCircle } from "./CapCircle";
import classes from "./CapTile.module.css";

type TileCap = Pick<
  BeerCap,
  "id" | "thumbnail_url" | "presigned_url" | "variant_name"
> & { beer: Pick<BeerCap["beer"], "name"> };

interface CapTileProps {
  cap: TileCap;
  /** The ids in the order shown, for previous/next on the cap's page. */
  capIds?: number[];
  /** Replaces the variant line, e.g. a match score. */
  caption?: ReactNode;
}

/** A cap in the collection: the cap itself, its beer's name under it. */
export function CapTile({ cap, capIds, caption }: CapTileProps) {
  const state: CapListState | undefined = capIds ? { capIds } : undefined;
  const name = cap.variant_name
    ? `${cap.beer.name}, ${cap.variant_name}`
    : cap.beer.name;
  return (
    <Link
      to={`/cap/${cap.id}`}
      state={state}
      className={classes.tile}
      title={name}
    >
      <CapCircle cap={cap} alt="" />
      <span className={`${classes.name} condensed`}>{cap.beer.name}</span>
      {caption ??
        (cap.variant_name && (
          <span className={classes.caption}>{cap.variant_name}</span>
        ))}
    </Link>
  );
}

export function CapTileSkeleton() {
  return (
    <div className={classes.tile} aria-hidden="true">
      <Skeleton circle className={classes.skeletonCircle} />
      <Skeleton height={12} width="70%" mt={4} />
    </div>
  );
}

interface CapGridProps {
  children: ReactNode;
  /** Smaller tiles, for rows of related caps. */
  compact?: boolean;
}

/** 3 caps a row on phones, up to 8 on wide screens. */
export function CapGrid({ children, compact }: CapGridProps) {
  return (
    <div
      className={compact ? `${classes.grid} ${classes.compact}` : classes.grid}
    >
      {children}
    </div>
  );
}
