import {
  ActionIcon,
  Burger,
  Button,
  Container,
  Drawer,
  Menu,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLock, IconLockOpen, IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdmin } from "../admin/adminContext";
import { useMatchingEnabled } from "../hooks/useMatchingEnabled";
import { notifySuccess } from "../utils/notify";
import { CapMark } from "./CapMark";
import { HeaderSlotContext } from "./headerSlotContext";
import { LanguageMenu } from "./LanguageMenu";
import classes from "./Layout.module.css";

export function Layout() {
  const { t } = useTranslation();
  const [menuOpened, { toggle: toggleMenu, close: closeMenu }] =
    useDisclosure();
  const { isAdmin, lock } = useAdmin();
  const matchingEnabled = useMatchingEnabled();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchSlot, setSearchSlot] = useState<HTMLDivElement | null>(null);

  // The name links to the collection; the rest of the menu is admin-only.
  const links = [
    ...(isAdmin && matchingEnabled
      ? [{ to: "/match", label: t("nav.matcher") }]
      : []),
    ...(isAdmin ? [{ to: "/admin", label: t("nav.admin") }] : []),
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
    notifySuccess(t("nav.adminLocked"));
  };

  return (
    <>
      <header>
        <Container size="xl" className={classes.header}>
          <Link to="/" className={`${classes.brand} display`}>
            <CapMark />
            {t("app.name")}
          </Link>
          <div ref={setSearchSlot} className={classes.searchSlot} />

          {isAdmin && (
            <>
              <nav aria-label={t("nav.main")} className={classes.nav}>
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
              <Button
                component={Link}
                to="/add"
                size="md"
                leftSection={<IconPlus size={18} stroke={2.5} />}
                className={classes.wide}
              >
                {t("nav.addCap")}
              </Button>
              <Menu position="bottom-end" withArrow>
                <Menu.Target>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size={48}
                    radius="xl"
                    aria-label={t("nav.adminOn")}
                    className={classes.wide}
                  >
                    <IconLockOpen size={20} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>{t("nav.adminOn")}</Menu.Label>
                  <Menu.Item
                    leftSection={<IconLock size={16} />}
                    onClick={lockAdmin}
                  >
                    {t("nav.lockAdmin")}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </>
          )}
          <LanguageMenu className={classes.language} />
          {isAdmin && (
            <Burger
              opened={menuOpened}
              onClick={toggleMenu}
              hiddenFrom="sm"
              aria-label={menuOpened ? t("nav.closeMenu") : t("nav.openMenu")}
            />
          )}
        </Container>
      </header>

      {isAdmin && (
        <Drawer
          opened={menuOpened}
          onClose={closeMenu}
          position="right"
          size="xs"
          title={<span className="display">{t("app.name")}</span>}
          hiddenFrom="sm"
        >
          <nav aria-label={t("nav.main")} className={classes.menu}>
            {[{ to: "/", label: t("nav.collection") }, ...links].map((link) => (
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
          <Button
            component={Link}
            to="/add"
            size="md"
            fullWidth
            leftSection={<IconPlus size={18} stroke={2.5} />}
            onClick={closeMenu}
            mt="lg"
          >
            {t("nav.addCap")}
          </Button>
          <Button
            variant="subtle"
            color="gray"
            fullWidth
            leftSection={<IconLock size={16} />}
            onClick={lockAdmin}
            mt="xs"
          >
            {t("nav.lockAdmin")}
          </Button>
        </Drawer>
      )}

      <HeaderSlotContext.Provider value={searchSlot}>
        <Container size="xl" component="main" className={classes.main}>
          <Outlet />
        </Container>
      </HeaderSlotContext.Provider>
    </>
  );
}
