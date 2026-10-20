import { ActionIcon, Group, Menu, Text, Tooltip } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconDots } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import classes from "./Admin.module.css";

export function AdminList({ children }: { children: ReactNode }) {
  return <ul className={classes.list}>{children}</ul>;
}

export interface RowAction {
  /** Names the action and the entry, e.g. "Delete Bernard 12°". */
  label: string;
  /** Short text for the phone menu, e.g. "Delete". */
  short: string;
  icon: ReactNode;
  onClick: () => void;
  danger?: boolean;
  loading?: boolean;
  /** Why it can't be used now; shown instead of the label. */
  disabledReason?: string;
}

interface AdminRowProps {
  leading?: ReactNode;
  title: string;
  details?: ReactNode;
  /** Short: "3 caps", "2 days ago". */
  meta?: ReactNode;
  actions?: RowAction[];
}

/**
 * One entry. Wide screens: icon buttons with tooltips. Phones: names may
 * wrap, the meta moves under the name and the actions fold into a menu.
 */
export function AdminRow({
  leading,
  title,
  details,
  meta,
  actions = [],
}: AdminRowProps) {
  const isPhone = useMediaQuery("(max-width: 36em)");
  return (
    <li className={classes.row}>
      {leading}
      <div className={classes.main}>
        <Text fw={600} lineClamp={isPhone ? 2 : 1}>
          {title}
        </Text>
        {(details || (isPhone && meta)) && (
          <Text size="sm" c="dimmed" lineClamp={isPhone ? 2 : 1}>
            {details}
            {isPhone && meta && (
              <>
                {details && ", "}
                {meta}
              </>
            )}
          </Text>
        )}
      </div>
      {meta && !isPhone && (
        <Text size="sm" c="dimmed" className={classes.meta}>
          {meta}
        </Text>
      )}
      {actions.length > 0 &&
        (isPhone ? (
          <RowMenu title={title} actions={actions} />
        ) : (
          <Group gap={4} wrap="nowrap" className={classes.actions}>
            {actions.map((action) => (
              <RowButton key={action.label} {...action} />
            ))}
          </Group>
        ))}
    </li>
  );
}

function RowButton({
  label,
  icon,
  onClick,
  danger,
  loading,
  disabledReason,
}: RowAction) {
  const disabled = !!disabledReason;
  return (
    <Tooltip label={disabledReason ?? label} withArrow openDelay={300}>
      {/* data-disabled keeps the tooltip working on a disabled button. */}
      <ActionIcon
        variant="subtle"
        color={danger ? "red" : "gray"}
        size="lg"
        aria-label={label}
        aria-disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        loading={loading}
        onClick={disabled ? undefined : onClick}
      >
        {icon}
      </ActionIcon>
    </Tooltip>
  );
}

function RowMenu({ title, actions }: { title: string; actions: RowAction[] }) {
  const { t } = useTranslation();
  const busy = actions.some((action) => action.loading);
  return (
    <Menu position="bottom-end" withArrow width={240}>
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          loading={busy}
          aria-label={t("admin.actionsFor", { name: title })}
        >
          <IconDots size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {actions.map((action) => (
          <Menu.Item
            key={action.label}
            leftSection={action.icon}
            color={action.danger && !action.disabledReason ? "red" : undefined}
            disabled={!!action.disabledReason}
            onClick={action.onClick}
          >
            {action.short}
            {action.disabledReason && (
              <Text size="xs" c="dimmed">
                {action.disabledReason}
              </Text>
            )}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
