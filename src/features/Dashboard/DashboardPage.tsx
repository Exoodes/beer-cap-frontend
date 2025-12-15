import { useEffect, useState } from "react";
import { fetchCaps } from "../../api/beerApi";
import type { BeerCap } from "../../types";

export const DashboardPage = () => {
  const [caps, setCaps] = useState<BeerCap[]>([]);

  useEffect(() => {
    fetchCaps().then((data) => setCaps(data));
  }, []);

  return (
    <div>
      <h1>My Beer Caps</h1>
      {caps.map((cap) => (
        <img key={cap.id} src={cap.presigned_url} alt="cap" width={100} />
      ))}
    </div>
  );
};
