import { Button, Menu } from "@mantine/core";
import { IconCheck, IconLanguage } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { currentLanguage, LANGUAGES } from "../i18n";

/** The UI language, for everyone: "EN" or "CS" with a menu of both. */
export function LanguageMenu({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const current = currentLanguage();
  return (
    <Menu position="bottom-end" withArrow>
      <Menu.Target>
        <Button
          variant="subtle"
          color="gray"
          size="md"
          radius="xl"
          leftSection={<IconLanguage size={18} />}
          aria-label={`${t("language.label")}: ${t(`language.${current}`)}`}
          className={className}
        >
          {current.toUpperCase()}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t("language.label")}</Menu.Label>
        {LANGUAGES.map((language) => (
          <Menu.Item
            key={language}
            lang={language}
            leftSection={
              <IconCheck
                size={16}
                visibility={language === current ? "visible" : "hidden"}
              />
            }
            onClick={() => i18n.changeLanguage(language)}
          >
            {t(`language.${language}`)}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
