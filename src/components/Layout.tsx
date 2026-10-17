import {
  ActionIcon,
  Affix,
  AppShell,
  Burger,
  Button,
  Container,
  Group,
  Menu,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLock, IconLockOpen, IconPlus } from "@tabler/icons-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdmin } from "../admin/adminContext";
import { useMatchingEnabled } from "../hooks/useMatchingEnabled";
import { notifySuccess } from "../utils/notify";
import { CapMark } from "./CapMark";
import classes from "./Layout.module.css";

export function Layout() {
  const [menuOpened, { toggle: toggleMenu, close: closeMenu }] =
    useDisclosure();
  const { isAdmin, lock } = useAdmin();
  const matchingEnabled = useMatchingEnabled();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const links = [
    { to: "/", label: "Collection" },
    ...(isAdmin && matchingEnabled ? [{ to: "/match", label: "Matcher" }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];
  // A cap's page is part of the collection.
  const isCurrent = (to: string) =>
    to === "/"
      ? pathname === "/" || pathname.startsWith("/cap/")
      : pathname.startsWith(to);

  const lockAdmin = () => {
    lock();
    closeMenu();
    navigate("/");
    notifySuccess("Admin mode locked on this device.");
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !menuOpened, desktop: true },
      }}
      padding="md"
    >
      <AppShell.Header className={classes.header}>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <Burger
                opened={menuOpened}
                onClick={toggleMenu}
                hiddenFrom="sm"
                size="sm"
                aria-label={menuOpened ? "Close menu" : "Open menu"}
              />
              <Link to="/" className={classes.brand} onClick={closeMenu}>
                <CapMark />
                Beer Caps
              </Link>
            </Group>

            <Group h="100%" gap="xs" wrap="nowrap" visibleFrom="sm">
              <nav
                aria-label="Main"
                style={{ display: "flex", height: "100%" }}
              >
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={classes.link}
                    aria-current={isCurrent(link.to) ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              {isAdmin && (
                <>
                  <Button
                    component={Link}
                    to="/add"
                    leftSection={<IconPlus size={16} />}
                    ml="sm"
                  >
                    Add cap
                  </Button>
                  <Menu position="bottom-end" withArrow>
                    <Menu.Target>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="lg"
                        aria-label="Admin mode is on"
                      >
                        <IconLockOpen size={20} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>Admin mode is on</Menu.Label>
                      <Menu.Item
                        leftSection={<IconLock size={16} />}
                        onClick={lockAdmin}
                      >
                        Lock admin mode
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </>
              )}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Navbar py="md">
        <nav aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={classes.menuLink}
              aria-current={isCurrent(link.to) ? "page" : undefined}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {isAdmin && (
          <Button
            variant="subtle"
            color="gray"
            c="dimmed"
            leftSection={<IconLock size={16} />}
            onClick={lockAdmin}
            mt="auto"
            mx="md"
          >
            Lock admin mode
          </Button>
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl">
          <Outlet />
        </Container>
      </AppShell.Main>

      {isAdmin && pathname !== "/add" && !menuOpened && (
        <Affix
          hiddenFrom="sm"
          position={{
            right: "1rem",
            bottom: "calc(1rem + env(safe-area-inset-bottom))",
          }}
        >
          <ActionIcon
            component={Link}
            to="/add"
            size={56}
            radius="xl"
            className={classes.fab}
            aria-label="Add a cap"
          >
            <IconPlus size={28} />
          </ActionIcon>
        </Affix>
      )}
    </AppShell>
  );
}
