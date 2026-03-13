"use client";

import { Select, Label, ListBox } from "@heroui/react";
import { STATUSES } from "../types";

interface FiltersProps {
  domains: string[];
  domainFilter: string;
  onDomainChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function Filters({
  domains,
  domainFilter,
  onDomainChange,
  statusFilter,
  onStatusChange,
}: FiltersProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-4">
      <Select
        className="w-[200px]"
        aria-label="Filter by domain"
        placeholder="All Domains"
        selectedKey={domainFilter || null}
        onSelectionChange={(key) => onDomainChange(key ? String(key) : "")}
      >
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted">
          Domain
        </Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="__all" textValue="All Domains">
              All Domains
              <ListBox.ItemIndicator />
            </ListBox.Item>
            {domains.map((d) => (
              <ListBox.Item key={d} id={d} textValue={d}>
                {d}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      <Select
        className="w-[200px]"
        aria-label="Filter by status"
        placeholder="All Statuses"
        selectedKey={statusFilter || null}
        onSelectionChange={(key) => onStatusChange(key ? String(key) : "")}
      >
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted">
          Status
        </Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="__all" textValue="All Statuses">
              All Statuses
              <ListBox.ItemIndicator />
            </ListBox.Item>
            {STATUSES.map((s) => (
              <ListBox.Item key={s} id={s} textValue={s}>
                {s}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  );
}
