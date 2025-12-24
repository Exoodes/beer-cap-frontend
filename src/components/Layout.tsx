import {
  AppShell,
  Burger,
  Button,
  Container,
  Group,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBeer, IconPlus } from "@tabler/icons-react";
import { Link, Outlet } from "react-router-dom";

export function Layout() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened, desktop: true },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group h="100%" px="md" justify="space-between">
            {/* 1. Logo Area */}
            <Group>
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
              <IconBeer size={28} color="#228be6" />
              <Title order={3}>Beer Cap Matcher</Title>
            </Group>

            <Group>
              <Button component={Link} to="/" variant="subtle">Dashboard</Button>
              <Button component={Link} to="/match" variant="subtle">Matcher</Button>
              <Button component={Link} to="/admin" variant="light" color="gray">Admin</Button>
              <Button component={Link} to="/add" leftSection={<IconPlus size={16} />}>Add Cap</Button>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Button
          component={Link}
          to="/"
          variant="subtle"
          onClick={toggle}
          mb="xs"
        >
          Dashboard
        </Button>
        <Button
          component={Link}
          to="/add"
          variant="subtle"
          onClick={toggle}
          mb="xs"
        >
          Add Cap
        </Button>
        <Button component={Link} to="/match" variant="subtle" onClick={toggle}>
          Find Match
        </Button>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
