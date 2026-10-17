import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  type CapListState,
  capTransitionName,
} from "../features/Dashboard/capNavigation";
import type { BeerCap } from "../types";
import { CapCircle, CapSocket } from "./CapCircle";
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

/** A cap in the collection: the cap in its socket, its beer's name under it. */
export function CapTile({ cap, capIds, caption }: CapTileProps) {
  const state: CapListState | undefined = capIds ? { capIds } : undefined;
  const name = cap.variant_name
    ? `${cap.beer.name}, ${cap.variant_name}`
    : cap.beer.name;
  return (
    <Link
      to={`/cap/${cap.id}`}
      state={state}
      viewTransition
      className={classes.tile}
      title={name}
    >
      <CapCircle cap={cap} alt="" transitionName={capTransitionName(cap.id)} />
      <span className={`${classes.name} display`}>{cap.beer.name}</span>
      {caption ??
        (cap.variant_name && (
          <span className={classes.caption}>{cap.variant_name}</span>
        ))}
    </Link>
  );
}

/** An empty socket while the collection loads. */
export function CapTileSkeleton() {
  return (
    <div className={classes.tile} aria-hidden="true">
      <CapSocket />
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
