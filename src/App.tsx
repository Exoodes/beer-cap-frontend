import { Button, Container, Group, Title } from "@mantine/core";
import { IconBeer } from "@tabler/icons-react";

function App() {
  return (
    <Container p="xl">
      <Title order={1} mb="md">
        Beer Cap Matcher 🍺
      </Title>

      <Group>
        <Button
          color="blue"
          size="lg"
          leftSection={<IconBeer size={20} />}
          onClick={() => alert("It works!")}
        >
          Add New Cap
        </Button>

        <Button variant="outline" size="lg" color="red">
          Delete
        </Button>
      </Group>
    </Container>
  );
}

export default App;
