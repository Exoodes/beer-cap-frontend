// src/features/Dashboard/MatcherPage.tsx
import {
  Badge,
  Box,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  type BeerCapWithQueryResult,
  findSimilarCaps,
} from "../../api/matcher";
import { BeerCapCard } from "../../components/BeerCapCard";
import { ImageDropzone } from "../../components/ImageDropzone";

export function MatcherPage() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<BeerCapWithQueryResult[]>([]);

  const mutation = useMutation({
    mutationFn: (image: File) => findSimilarCaps(image),
    onSuccess: (data) => {
      setResults(data);
    },
    onError: (error) => {
      console.error("Match failed:", error);
      alert("Failed to find similar caps.");
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
          <Title order={2}>🔍 Beer Cap Matcher</Title>
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
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
              {results.map((result) => (
                <Box key={result.id} pos="relative">
                  <Badge
                    pos="absolute"
                    top={10}
                    right={10}
                    style={{ zIndex: 2 }}
                    color="blue"
                    variant="filled"
                  >
                    Match:{" "}
                    {(result.query_result.mean_similarity * 100).toFixed(1)}%
                  </Badge>
                  {/* Reuse existing card logic */}
                  <BeerCapCard
                    cap={{
                      id: result.id,
                      variant_name: result.variant_name,
                      collected_date: result.collected_date,
                      presigned_url: result.presigned_url,
                      // Note: Result items from similarity endpoint don't include full beer object
                      // in this specific schema, so we pass a partial for display
                      beer: {
                        id: 0,
                        name: "Similar Match",
                        rating: 0,
                        country: null,
                      },
                    }}
                  />
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
