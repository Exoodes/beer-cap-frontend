import {
  AppShell,
  Burger,
  Button,
  Container,
  Group,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBeer, IconPlus, IconSearch } from "@tabler/icons-react";
import { Link, Outlet, useLocation } from "react-router-dom";

export function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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

            {/* 2. Desktop Navigation (Hidden on Mobile) */}
            <Group gap="xs" visibleFrom="sm">
              <Button
                component={Link}
                to="/"
                variant={isActive("/") ? "light" : "subtle"}
              >
                Dashboard
              </Button>
              <Button
                component={Link}
                to="/add"
                variant={isActive("/add") ? "light" : "subtle"}
                leftSection={<IconPlus size={16} />}
              >
                Add Cap
              </Button>
              <Button
                component={Link}
                to="/match"
                variant={isActive("/match") ? "light" : "subtle"}
                leftSection={<IconSearch size={16} />}
              >
                Find Match
              </Button>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      {/* 3. Mobile Navigation Drawer (Hidden on Desktop) */}
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

      {/* 4. The Content Area */}
      <AppShell.Main>
        <Container size="xl">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
