import { useEffect, useRef, useState } from "react";
import type { BeerCap } from "../types";
import { getImageUrl } from "../utils/imageUtils";
import classes from "./CapCircle.module.css";

interface SocketProps {
  /** Diameter in px; without it the socket fills its container's width. */
  size?: number;
  /** A larger, deeper socket for the cap's own page. */
  deep?: boolean;
  /** Brass socket, e.g. for the photo being added. */
  highlighted?: boolean;
  /** Pairs this socket with one on the next page, so the cap moves across. */
  transitionName?: string;
}

type CapCircleProps = SocketProps & {
  alt: string;
  /** Load the full photo rather than the thumbnail (large views). */
  full?: boolean;
} & (
    | { cap: Pick<BeerCap, "thumbnail_url" | "presigned_url">; file?: never }
    | { file: File; cap?: never }
  );

/**
 * A round hole in the felt. Empty, it stands for a cap still loading or
 * not there; see CapCircle for one with a cap in it.
 */
export function CapSocket({
  size,
  deep,
  highlighted,
  transitionName,
  children,
}: SocketProps & { children?: React.ReactNode }) {
  const className = [
    classes.socket,
    deep && classes.deep,
    highlighted && classes.highlighted,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span
      className={className}
      style={{
        width: size ?? "100%",
        height: size,
        viewTransitionName: transitionName,
      }}
    >
      {children}
    </span>
  );
}

/**
 * A cap shown as what it is: round, uncropped, seated in its socket. A
 * missing thumbnail falls back to the full photo, then to an empty socket.
 */
export function CapCircle({ alt, full, cap, file, ...socket }: CapCircleProps) {
  return (
    <CapSocket {...socket}>
      {file ? (
        <FileImage file={file} alt={alt} />
      ) : (
        <CapImage key={cap.presigned_url} cap={cap} alt={alt} full={full} />
      )}
    </CapSocket>
  );
}

function CapImage({
  cap,
  alt,
  full,
}: {
  cap: Pick<BeerCap, "thumbnail_url" | "presigned_url">;
  alt: string;
  full?: boolean;
}) {
  const sources = [cap.thumbnail_url, cap.presigned_url]
    .filter((url): url is string => !!url)
    .map(getImageUrl);
  const [failed, setFailed] = useState(0);
  // A full photo starts as the thumbnail, which the collection has already
  // loaded, so a cap opened from it lands in its socket at once; the
  // photo replaces it when it has loaded.
  const fullUrl = full ? getImageUrl(cap.presigned_url) : null;
  const [fullLoaded, setFullLoaded] = useState(false);
  useEffect(() => {
    if (!fullUrl) return;
    const image = new Image();
    image.onload = () => setFullLoaded(true);
    image.src = fullUrl;
    return () => {
      image.onload = null;
    };
  }, [fullUrl]);
  const src = fullUrl && fullLoaded ? fullUrl : sources[failed];
  if (!src) return null;
  return (
    <img
      key={src}
      src={src}
      alt={alt}
      loading="lazy"
      className={classes.image}
      onError={() => setFailed((count) => count + 1)}
    />
  );
}

/**
 * One object URL per file, created and released in the same effect, so a
 * StrictMode remount can't leave the image pointing at a revoked URL.
 */
function FileImage({ file, alt }: { file: File; alt: string }) {
  const img = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (img.current) img.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return <img ref={img} alt={alt} className={classes.image} />;
}
