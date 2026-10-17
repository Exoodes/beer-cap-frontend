import { Tabs, Title } from "@mantine/core";
import {
  IconArchive,
  IconBeer,
  IconCertificate,
  IconRobot,
  IconWorld,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  createBrand,
  createCountry,
  deleteBrand,
  deleteCountry,
  getBrands,
  getCountries,
  mergeBrand,
  mergeCountry,
} from "../../api/references";
import { useMatchingEnabled } from "../../hooks/useMatchingEnabled";
import { BrandPicker, CountryPicker } from "../AddCap/pickers";
import classes from "./Admin.module.css";
import { BackupsTab } from "./BackupsTab";
import { BeersTab } from "./BeersTab";
import { EntriesTab } from "./EntriesTab";
import { EditBrandForm, EditCountryForm } from "./editForms";
import { PipelineTab } from "./PipelineTab";

const TABS = ["beers", "brands", "countries", "backups", "pipeline"] as const;
type Tab = (typeof TABS)[number];

export function AdminPage() {
  const matchingEnabled = useMatchingEnabled();
  // The open tab is in the URL, so refresh and back keep it.
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab");
  const tab: Tab = TABS.includes(requested as Tab)
    ? (requested as Tab)
    : "beers";
  const openTab = (next: string | null) =>
    setParams(next && next !== "beers" ? { tab: next } : {}, { replace: true });

  return (
    <>
      <Title order={1} mb="lg">
        Admin
      </Title>

      {/* Panels mount when opened, so e.g. backups load only when needed. */}
      <Tabs value={tab} onChange={openTab} keepMounted={false}>
        <Tabs.List className={classes.tabs} mb="lg">
          <Tabs.Tab value="beers" leftSection={<IconBeer size={16} />}>
            Beers
          </Tabs.Tab>
          <Tabs.Tab value="brands" leftSection={<IconCertificate size={16} />}>
            Brands
          </Tabs.Tab>
          <Tabs.Tab value="countries" leftSection={<IconWorld size={16} />}>
            Countries
          </Tabs.Tab>
          <Tabs.Tab value="backups" leftSection={<IconArchive size={16} />}>
            Backups
          </Tabs.Tab>
          {matchingEnabled && (
            <Tabs.Tab value="pipeline" leftSection={<IconRobot size={16} />}>
              AI pipeline
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value="beers">
          <BeersTab />
        </Tabs.Panel>
        <Tabs.Panel value="brands">
          <BrandsTab />
        </Tabs.Panel>
        <Tabs.Panel value="countries">
          <CountriesTab />
        </Tabs.Panel>
        <Tabs.Panel value="backups">
          <BackupsTab />
        </Tabs.Panel>
        {matchingEnabled && (
          <Tabs.Panel value="pipeline">
            <PipelineTab />
          </Tabs.Panel>
        )}
      </Tabs>
    </>
  );
}

function BrandsTab() {
  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });
  return (
    <EntriesTab
      noun="brand"
      entries={brands}
      invalidates={["brands", "beers", "beerCaps", "beerCap"]}
      create={(name) => createBrand(name)}
      remove={deleteBrand}
      merge={mergeBrand}
      renderEdit={(brand, done) => (
        <EditBrandForm brand={brand} onDone={done} />
      )}
      renderPicker={(others, value, onChange) => (
        <BrandPicker
          brands={others}
          value={value}
          onChange={onChange}
          allowCreate={false}
        />
      )}
    />
  );
}

function CountriesTab() {
  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  });
  return (
    <EntriesTab
      noun="country"
      entries={countries}
      invalidates={["countries", "beers", "beerCaps", "beerCap"]}
      create={(name, description) => createCountry({ name, description })}
      remove={deleteCountry}
      merge={mergeCountry}
      withDescription
      renderEdit={(country, done) => (
        <EditCountryForm country={country} onDone={done} />
      )}
      renderPicker={(others, value, onChange) => (
        <CountryPicker
          countries={others}
          value={value}
          onChange={onChange}
          allowCreate={false}
        />
      )}
    />
  );
}
