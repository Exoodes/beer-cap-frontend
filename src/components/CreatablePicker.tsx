import { Badge, Combobox, InputBase, useCombobox } from "@mantine/core";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { cleanName } from "../utils/names";
import { matchesWords, normalize } from "../utils/search";

/** An existing entry by id, or a new one to create by name. */
export type Choice = { id: number } | { name: string };

export interface PickerItem {
  id: number;
  name: string;
  /** What typing searches; defaults to the name. */
  searchText?: string;
}

interface CreatablePickerProps<T extends PickerItem> {
  label: string;
  placeholder?: string;
  error?: ReactNode;
  items: T[];
  value: Choice | null;
  onChange: (choice: Choice) => void;
  renderOption?: (item: T) => ReactNode;
  /** Text of the last option, e.g. `Create beer "Gambrinus Nealko"`. */
  createLabel: (name: string) => ReactNode;
  /** Offer Create even when an entry has exactly this name. */
  createWhenExact?: boolean;
  /** Off: only existing entries can be picked. */
  allowCreate?: boolean;
}

const CREATE = "$create";
const MAX_OPTIONS = 50;

/**
 * Search existing entries, or create a new one as the last option, never
 * as a separate mode. Searching ignores diacritics and word order.
 */
export function CreatablePicker<T extends PickerItem>({
  label,
  placeholder,
  error,
  items,
  value,
  onChange,
  renderOption,
  createLabel,
  createWhenExact = false,
  allowCreate = true,
}: CreatablePickerProps<T>) {
  const { t } = useTranslation();
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const textOf = (choice: Choice | null) => {
    if (!choice) return "";
    if ("name" in choice) return choice.name;
    return items.find((item) => item.id === choice.id)?.name ?? "";
  };

  // While typing the input shows what was typed; otherwise it shows the
  // chosen entry, derived each render so it follows resets, suggestions and
  // items that load later.
  const [search, setSearch] = useState("");
  const [typing, setTyping] = useState(false);
  const shown = typing ? search : textOf(value);

  const query = typing ? search : "";
  const matches = items
    .filter((item) => matchesWords(item.searchText ?? item.name, query))
    .slice(0, MAX_OPTIONS);
  const typed = cleanName(search);
  const exact = items.some((item) => normalize(item.name) === normalize(typed));
  const canCreate =
    allowCreate && typing && typed !== "" && (createWhenExact || !exact);

  const submit = (option: string) => {
    if (option === CREATE) {
      onChange({ name: typed });
    } else {
      onChange({ id: Number(option) });
    }
    setTyping(false);
    combobox.closeDropdown();
  };

  const isNew = value !== null && "name" in value;

  return (
    <Combobox store={combobox} onOptionSubmit={submit}>
      <Combobox.Target>
        <InputBase
          label={label}
          placeholder={placeholder}
          error={error}
          value={shown}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            setTyping(true);
            combobox.openDropdown();
            combobox.selectFirstOption();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => {
            combobox.closeDropdown();
            setTyping(false);
          }}
          rightSection={
            isNew && !typing ? (
              <Badge variant="light" size="sm">
                {t("common.new")}
              </Badge>
            ) : (
              <Combobox.Chevron />
            )
          }
          rightSectionWidth={isNew && !typing ? 56 : undefined}
          rightSectionPointerEvents="none"
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options mah={340} style={{ overflowY: "auto" }}>
          {matches.map((item) => (
            <Combobox.Option value={String(item.id)} key={item.id}>
              {renderOption ? renderOption(item) : item.name}
            </Combobox.Option>
          ))}
          {canCreate && (
            <Combobox.Option value={CREATE}>
              {createLabel(typed)}
            </Combobox.Option>
          )}
          {!matches.length && !canCreate && (
            <Combobox.Empty>
              {allowCreate ? t("picker.typeToAdd") : t("picker.nothingFound")}
            </Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
