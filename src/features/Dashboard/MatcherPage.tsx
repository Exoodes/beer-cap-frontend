// src/features/Dashboard/MatcherPage.tsx
import {
  Box,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { findSimilarCaps } from "../../api/matcher";
import { CapGrid, CapTile } from "../../components/CapTile";
import { ImageDropzone } from "../../components/ImageDropzone";
import type { BeerCapWithQueryResult } from "../../types";

export function MatcherPage() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<BeerCapWithQueryResult[]>([]);

  const mutation = useMutation({
    mutationFn: (image: File) => findSimilarCaps(image),
    onSuccess: (data) => {
      setResults(data);
    },
  });

  const handleSearch = () => {
    if (file) {
      mutation.mutate(file);
    }
  };

  const handleClear = () => {
    setFile(null);
    setResults([]);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Box>
          <Title order={2}>Matcher</Title>
          <Text c="dimmed">
            Upload a photo of a beer cap to find matches in your collection.
          </Text>
        </Box>

        <Paper withBorder p="md" radius="md" pos="relative">
          <LoadingOverlay
            visible={mutation.isPending}
            overlayProps={{ blur: 2 }}
          />
          <Stack>
            <ImageDropzone
              image={file}
              onDrop={setFile}
              onClear={handleClear}
            />

            <Group justify="flex-end">
              {file && (
                <Button
                  variant="default"
                  leftSection={<IconX size={16} />}
                  onClick={handleClear}
                >
                  Clear
                </Button>
              )}
              <Button
                disabled={!file}
                loading={mutation.isPending}
                leftSection={<IconSearch size={16} />}
                onClick={handleSearch}
              >
                Find Matches
              </Button>
            </Group>
          </Stack>
        </Paper>

        {results.length > 0 && (
          <Box>
            <Title order={3} mb="lg">
              Similarity Results
            </Title>
            <CapGrid>
              {results.map((result) => (
                <CapTile
                  key={result.id}
                  // Similarity results don't include the beer; the cap's
                  // page shows it.
                  cap={{
                    ...result,
                    thumbnail_url: null,
                    beer: { name: `Cap ${result.id}` },
                  }}
                  caption={
                    <Text size="xs" c="dimmed">
                      {(result.query_result.mean_similarity * 100).toFixed(0)}%
                      match
                    </Text>
                  }
                />
              ))}
            </CapGrid>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
