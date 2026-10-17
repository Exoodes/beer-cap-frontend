import { Badge, Combobox, InputBase, useCombobox } from "@mantine/core";
import { type ReactNode, useState } from "react";
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
}: CreatablePickerProps<T>) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const textOf = (choice: Choice | null) => {
    if (!choice) return "";
    if ("name" in choice) return choice.name;
    return items.find((item) => item.id === choice.id)?.name ?? "";
  };

  // The input shows the chosen entry until the user types; it follows
  // `value` when the parent changes it (e.g. a reset or a suggestion).
  const [search, setSearch] = useState(() => textOf(value));
  const [typing, setTyping] = useState(false);
  const [shownValue, setShownValue] = useState(value);
  if (shownValue !== value) {
    setShownValue(value);
    setSearch(textOf(value));
    setTyping(false);
  }

  const query = typing ? search : "";
  const matches = items
    .filter((item) => matchesWords(item.searchText ?? item.name, query))
    .slice(0, MAX_OPTIONS);
  const typed = cleanName(search);
  const exact = items.some((item) => normalize(item.name) === normalize(typed));
  const canCreate = typing && typed !== "" && (createWhenExact || !exact);

  const submit = (option: string) => {
    if (option === CREATE) {
      onChange({ name: typed });
    } else {
      onChange({ id: Number(option) });
    }
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
          value={search}
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
            setSearch(textOf(value));
            setTyping(false);
          }}
          rightSection={
            isNew && !typing ? (
              <Badge variant="light" size="sm">
                New
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
            <Combobox.Empty>Type a name to add it</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
