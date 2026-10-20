import {
  Anchor,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { createCap, getAllCaps } from "../../api/beerCaps";
import { getBeers, getBrands, getCountries } from "../../api/references";
import { CapCircle } from "../../components/CapCircle";
import type { Choice } from "../../components/CreatablePicker";
import { ImageDropzone } from "../../components/ImageDropzone";
import type { Beer, BeerCap } from "../../types";
import { pluralCaps } from "../../utils/format";
import { notifyError, notifySuccess } from "../../utils/notify";
import { prepareImageForUpload } from "../../utils/prepareImage";
import classes from "./AddCapPage.module.css";
import {
  findSimilarBeers,
  groupCapsByBeer,
  guessBrandId,
  guessCountryId,
} from "./matching";
import { BeerPicker, BrandPicker, CountryPicker } from "./pickers";

type Field = "file" | "beer" | "brand" | "country";

const today = () => dayjs().format("YYYY-MM-DD");

function appendChoice(
  data: FormData,
  choice: Choice,
  idField: string,
  nameField: string,
) {
  if ("id" in choice) data.append(idField, String(choice.id));
  else data.append(nameField, choice.name);
}

export function AddCapPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: caps = [] } = useQuery({
    queryKey: ["beerCaps"],
    queryFn: getAllCaps,
  });
  const { data: beers = [] } = useQuery({
    queryKey: ["beers"],
    queryFn: getBeers,
  });
  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });
  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  });
  const capsByBeer = useMemo(() => groupCapsByBeer(caps), [caps]);

  const [file, setFile] = useState<File | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [beer, setBeer] = useState<Choice | null>(null);
  const [brand, setBrand] = useState<Choice | null>(null);
  const [country, setCountry] = useState<Choice | null>(null);
  const [variant, setVariant] = useState("");
  const [collected, setCollected] = useState<string | null>(today);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [justAdded, setJustAdded] = useState<BeerCap[]>([]);

  const clearError = (field: Field) =>
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });

  const existingBeer: Beer | undefined =
    beer && "id" in beer ? beers.find((b) => b.id === beer.id) : undefined;
  const existingCaps = existingBeer
    ? (capsByBeer.get(existingBeer.id) ?? [])
    : [];
  const newBeerName = beer && "name" in beer ? beer.name : null;
  const similarBeers = newBeerName ? findSimilarBeers(newBeerName, beers) : [];

  const mutation = useMutation({
    mutationFn: createCap,
    onSuccess: () => {
      for (const key of ["beerCaps", "beers", "brands", "countries"]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
  });

  const handlePick = async (picked: File) => {
    setPreparing(true);
    try {
      setFile(await prepareImageForUpload(picked));
      clearError("file");
    } finally {
      setPreparing(false);
    }
  };

  const chooseCountryFor = (brandId: number) => {
    if (country) return;
    const countryId = guessCountryId(brandId, beers);
    if (countryId) setCountry({ id: countryId });
  };

  const chooseBeer = (choice: Choice) => {
    setBeer(choice);
    clearError("beer");
    // A new beer: start from the brand and country it most likely has.
    if ("name" in choice && !brand) {
      const brandId = guessBrandId(choice.name, brands, beers);
      if (brandId) {
        setBrand({ id: brandId });
        chooseCountryFor(brandId);
      }
    }
  };

  const chooseBrand = (choice: Choice) => {
    setBrand(choice);
    clearError("brand");
    if ("id" in choice) chooseCountryFor(choice.id);
  };

  const startNextCap = () => {
    // Caps are often added in a batch on the same day: keep the date.
    setFile(null);
    setBeer(null);
    setBrand(null);
    setCountry(null);
    setVariant("");
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const alreadyHaveIt = () => {
    startNextCap();
    notifySuccess(t("addCap.notSaved"));
  };

  const save = (then: "next" | "close") => {
    const found: Partial<Record<Field, string>> = {};
    if (!file) found.file = t("addCap.needPhoto");
    if (!beer) found.beer = t("addCap.needBeer");
    if (newBeerName) {
      if (!brand) found.brand = t("addCap.needBrand");
      if (!country) found.country = t("addCap.needCountry");
    }
    setErrors(found);
    if (!file || !beer || Object.keys(found).length) return;

    const data = new FormData();
    data.append("file", file);
    if (variant.trim()) data.append("variant_name", variant.trim());
    if (collected) data.append("collected_date", collected);
    if ("id" in beer) {
      data.append("beer_id", String(beer.id));
    } else if (brand && country) {
      data.append("beer_name", beer.name);
      appendChoice(data, brand, "beer_brand_id", "beer_brand_name");
      appendChoice(data, country, "country_id", "country_name");
    }

    mutation.mutate(data, {
      onSuccess: (cap) => {
        setJustAdded((added) => [cap, ...added]);
        if (then === "close") {
          notifySuccess(t("addCap.added", { beer: cap.beer.name }));
          navigate("/");
        } else {
          notifySuccess(t("addCap.addedNext", { beer: cap.beer.name }));
          startNextCap();
        }
      },
    });
  };

  const busy = mutation.isPending || preparing;

  return (
    <Stack gap="xl" maw={640} mx="auto" pb="xl">
      <Group justify="space-between" align="baseline">
        <Title order={1}>{t("addCap.title")}</Title>
        <Anchor component={Link} to="/">
          {t("common.cancel")}
        </Anchor>
      </Group>

      <Stack gap="xs">
        <Title order={2} fz="h3">
          {t("addCap.photo")}
        </Title>
        <ImageDropzone
          image={file}
          onDrop={handlePick}
          onClear={() => setFile(null)}
          onReject={(message) =>
            notifyError(new Error(message), t("photo.notAdded"))
          }
          busy={preparing}
        />
        {errors.file && (
          <Text c="red" size="sm">
            {errors.file}
          </Text>
        )}
      </Stack>

      <Stack gap="sm">
        <Title order={2} fz="h3">
          {t("addCap.whichBeer")}
        </Title>
        <BeerPicker
          beers={beers}
          capsByBeer={capsByBeer}
          value={beer}
          onChange={chooseBeer}
          error={errors.beer}
        />

        {existingBeer && existingCaps.length > 0 && (
          <div className={classes.panel}>
            <Text fw={600}>
              {t("addCap.alreadyHave", {
                count: existingCaps.length,
                beer: existingBeer.name,
              })}
            </Text>
            <Text size="sm" c="dimmed">
              {t("addCap.looksSame")}
            </Text>
            <div className={classes.compare}>
              {existingCaps.map((cap) => (
                <figure key={cap.id} className={classes.figure}>
                  <CapCircle cap={cap} alt={existingBeer.name} size={88} />
                  <figcaption>{cap.variant_name ?? " "}</figcaption>
                </figure>
              ))}
              {file && (
                <figure className={classes.figure}>
                  <CapCircle
                    file={file}
                    alt={t("addCap.newPhoto")}
                    size={88}
                    highlighted
                  />
                  <figcaption>{t("addCap.newPhoto")}</figcaption>
                </figure>
              )}
            </div>
            <Group gap="sm">
              <Button variant="default" onClick={alreadyHaveIt}>
                {t("addCap.alreadyHaveIt")}
              </Button>
              <Text size="sm" c="dimmed">
                {t("addCap.newDesign")}
              </Text>
            </Group>
          </div>
        )}

        {similarBeers.length > 0 && (
          <div className={classes.panel}>
            <Text fw={600}>{t("addCap.oneOfThese")}</Text>
            <Text size="sm" c="dimmed">
              {t("addCap.similarExist")}
            </Text>
            <Stack gap="xs">
              {similarBeers.map((similar) => {
                const similarCaps = capsByBeer.get(similar.id) ?? [];
                return (
                  <Group key={similar.id} gap="sm" wrap="nowrap">
                    {similarCaps[0] && (
                      <CapCircle cap={similarCaps[0]} alt="" size={40} />
                    )}
                    <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={600} truncate>
                        {similar.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {[
                          similar.beer_brand?.name,
                          pluralCaps(similarCaps.length),
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                    </Stack>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => chooseBeer({ id: similar.id })}
                    >
                      {t("addCap.useThisBeer")}
                    </Button>
                  </Group>
                );
              })}
            </Stack>
          </div>
        )}

        {newBeerName && (
          <SimpleGrid cols={{ base: 1, xs: 2 }}>
            <BrandPicker
              brands={brands}
              value={brand}
              onChange={chooseBrand}
              error={errors.brand}
            />
            <CountryPicker
              countries={countries}
              value={country}
              onChange={(choice) => {
                setCountry(choice);
                clearError("country");
              }}
              error={errors.country}
            />
          </SimpleGrid>
        )}
      </Stack>

      <Stack gap="sm">
        <Title order={2} fz="h3">
          {t("addCap.details")}
        </Title>
        <SimpleGrid cols={{ base: 1, xs: 2 }}>
          <TextInput
            label={t("capForm.variant")}
            description={t("common.optional")}
            placeholder={t("capForm.variantPlaceholder")}
            value={variant}
            onChange={(event) => setVariant(event.currentTarget.value)}
          />
          <DateInput
            label={t("capForm.collected")}
            description={t("capForm.collectedHint")}
            valueFormat="D. M. YYYY"
            clearable
            maxDate={new Date()}
            value={collected}
            onChange={setCollected}
          />
        </SimpleGrid>
      </Stack>

      <div className={classes.actions}>
        <Button
          size="md"
          loading={mutation.isPending}
          disabled={busy}
          onClick={() => save("next")}
        >
          {t("addCap.saveNext")}
        </Button>
        <Button
          size="md"
          variant="default"
          disabled={busy}
          onClick={() => save("close")}
        >
          {t("addCap.saveClose")}
        </Button>
      </div>

      {justAdded.length > 0 && (
        <Stack gap="sm">
          <Title order={2} fz="h3">
            {t("addCap.addedJustNow")}
          </Title>
          <div className={classes.added}>
            {justAdded.map((cap) => (
              <Link
                key={cap.id}
                to={`/cap/${cap.id}`}
                className={classes.addedCap}
              >
                <CapCircle cap={cap} alt="" size={64} />
                <span className="display">{cap.beer.name}</span>
              </Link>
            ))}
          </div>
        </Stack>
      )}
    </Stack>
  );
}
