import {
  AppShell,
  Badge,
  Burger,
  Button,
  Container,
  Group,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBeer, IconPlus, IconShieldCheck } from "@tabler/icons-react";
import { Link, Outlet, useNavigate } from "react-router-dom";

export function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();

  const isAdmin = !!localStorage.getItem("admin_token");

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/");
    window.location.reload(); // Force a full re-render to hide admin elements
  };

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
            <Group>
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
              {/* Change the icon color to gold if admin, otherwise blue */}
              <IconBeer size={28} color={isAdmin ? "#fab005" : "#228be6"} />
              <Title order={3}>Beer Cap Matcher</Title>

              {/* VISUAL INDICATOR & LOGOUT */}
              {isAdmin && (
                <Badge
                  color="teal"
                  variant="light"
                  leftSection={<IconShieldCheck size={12} />}
                  style={{ cursor: "pointer" }}
                  onClick={handleLogout}
                  title="Click to lock (Log out)"
                >
                  Admin
                </Badge>
              )}
            </Group>

            <Group>
              <Button component={Link} to="/" variant="subtle">
                Dashboard
              </Button>
              {isAdmin && (
                <>
                  <Button component={Link} to="/match" variant="subtle">
                    Matcher
                  </Button>
                  <Button
                    component={Link}
                    to="/admin"
                    variant="light"
                    color="gray"
                  >
                    Admin
                  </Button>
                  <Button
                    component={Link}
                    to="/add"
                    leftSection={<IconPlus size={16} />}
                  >
                    Add Cap
                  </Button>
                </>
              )}
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
        {isAdmin && (
          <>
            <Button
              component={Link}
              to="/add"
              variant="subtle"
              onClick={toggle}
              mb="xs"
            >
              Add Cap
            </Button>
            <Button
              component={Link}
              to="/match"
              variant="subtle"
              onClick={toggle}
            >
              Find Match
            </Button>
          </>
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
