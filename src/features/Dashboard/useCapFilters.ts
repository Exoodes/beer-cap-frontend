import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  type CapFilters,
  filtersFromParams,
  filtersToParams,
} from "./capFilters";
import { rememberCollectionSearch } from "./capNavigation";

const fromSearch = (search: string) =>
  filtersFromParams(new URLSearchParams(search));

/**
 * Dashboard filters, mirrored into the URL query string.
 *
 * Writes go straight to `history.replaceState` rather than through
 * `setSearchParams`: React Router applies navigations as transitions, and
 * while someone types those keep restarting, so URL-driven state lags and a
 * second input event can overwrite the first with stale values. The browser
 * URL still holds the filters, so a refresh or coming back from a cap's page
 * restores them (the router reads the URL then). Any navigation by the
 * router itself while the dashboard is open (e.g. the "Dashboard" link)
 * changes `location.key` and resets the filters from its URL.
 */
export function useCapFilters() {
  const location = useLocation();
  const [state, setState] = useState(() => ({
    locationKey: location.key,
    filters: fromSearch(location.search),
  }));

  let { filters } = state;
  // Adjusting state during render (not in an effect) is React's recommended
  // pattern for reacting to a changed input.
  if (state.locationKey !== location.key) {
    filters = fromSearch(location.search);
    setState({ locationKey: location.key, filters });
  }

  const setFilters = (next: CapFilters) => {
    setState({ locationKey: location.key, filters: next });
    const query = filtersToParams(next).toString();
    // Keep React Router's entry in history.state; only the URL changes.
    window.history.replaceState(
      window.history.state,
      "",
      query ? `?${query}` : location.pathname,
    );
  };

  // A cap's "Back" link returns to the collection with these filters.
  const search = filtersToParams(filters).toString();
  useEffect(() => {
    rememberCollectionSearch(search ? `?${search}` : "");
  }, [search]);

  return [filters, setFilters] as const;
}
