import { useEffect, useRef, useState } from "react";
import type { BeerCap } from "../types";
import { getImageUrl } from "../utils/imageUtils";
import classes from "./CapCircle.module.css";

type CapCircleProps = {
  alt: string;
  /** Diameter in px. */
  size: number;
  /** Amber ring, e.g. for the photo being added. */
  highlighted?: boolean;
} & (
  | { cap: Pick<BeerCap, "thumbnail_url" | "presigned_url">; file?: never }
  | { file: File; cap?: never }
);

/**
 * A cap shown as what it is: round and uncropped, with the one shared
 * shadow. A missing thumbnail falls back to the full photo, then to an
 * empty circle.
 */
export function CapCircle({
  alt,
  size,
  highlighted,
  cap,
  file,
}: CapCircleProps) {
  const style = { width: size, height: size };
  const className = highlighted
    ? `${classes.circle} ${classes.highlighted}`
    : classes.circle;

  return (
    <span className={className} style={style}>
      {file ? (
        <FileImage file={file} alt={alt} />
      ) : (
        <CapImage key={cap.presigned_url} cap={cap} alt={alt} />
      )}
    </span>
  );
}

function CapImage({
  cap,
  alt,
}: {
  cap: Pick<BeerCap, "thumbnail_url" | "presigned_url">;
  alt: string;
}) {
  const sources = [cap.thumbnail_url, cap.presigned_url]
    .filter((url): url is string => !!url)
    .map(getImageUrl);
  const [failed, setFailed] = useState(0);
  const src = sources[failed];
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
