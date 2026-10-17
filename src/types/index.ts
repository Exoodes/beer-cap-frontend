// Domain types are aliases of the backend's OpenAPI schemas (src/types/api.d.ts).
// Regenerate with `npm run gen:api` (backend running) after an API change.
import type { components } from "./api";

type Schemas = components["schemas"];

export type Country = Schemas["CountryResponseBase"];
export type CountryWithBeers = Schemas["CountryResponseWithBeers"];
export type BeerBrand = Schemas["BeerBrandResponseBase"];
export type BeerBrandWithBeers = Schemas["BeerBrandResponseWithBeers"];
export type BeerSummary = Schemas["BeerResponseBase"];
export type Beer = Schemas["BeerResponseWithCaps"];
export type BeerCap = Schemas["BeerCapResponseWithUrl"];
export type BeerCapWithQueryResult = Schemas["BeerCapResponseWithQueryResult"];
export type StatusResponse = Schemas["StatusResponse"];

export type BeerUpdate = Schemas["BeerUpdateSchema"];
export type BeerCapUpdate = Schemas["BeerCapUpdateSchema"];
export type BeerBrandCreate = Schemas["BeerBrandCreateSchema"];
export type BeerBrandUpdate = Schemas["BeerBrandUpdateSchema"];
export type CountryCreate = Schemas["CountryCreateSchema"];
export type CountryUpdate = Schemas["CountryUpdateSchema"];

/** `GET /health` (not described by a response model). */
export interface HealthStatus {
  status: "ok" | "error";
  checks: Record<string, "ok" | "error">;
  matching: { enabled: boolean; index_loaded: boolean };
}
