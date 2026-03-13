"use client";

import { useState } from "react";
import {
  Modal,
  Button,
  TextField,
  Label,
  Input,
  Select,
  ListBox,
  Slider,
} from "@heroui/react";
import type { Dataset, Status } from "../types";
import { DOMAINS, STATUSES } from "../types";

interface CreateDatasetModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dataset: Omit<Dataset, "id">) => void;
}

export function CreateDatasetModal({
  isOpen,
  onOpenChange,
  onSubmit,
}: CreateDatasetModalProps) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState<string>("");
  const [owner, setOwner] = useState("");
  const [qualityScore, setQualityScore] = useState(75);
  const [status, setStatus] = useState<string>("Approved");

  const canSubmit = name.trim() && domain && owner.trim() && status;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      domain,
      owner: owner.trim(),
      qualityScore,
      status: status as Status,
    });
    onOpenChange(false);
    // Reset form
    setName("");
    setDomain("");
    setOwner("");
    setQualityScore(75);
    setStatus("Approved");
  };

  const scoreColor =
    qualityScore >= 80
      ? "text-[var(--success)]"
      : qualityScore >= 60
        ? "text-[var(--warning)]"
        : "text-[var(--danger)]";

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="modal-backdrop"
    >
      <Modal.Container placement="auto">
        <Modal.Dialog className="sm:max-w-lg">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold tracking-tight">
              Create New Dataset
            </Modal.Heading>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-5 p-5">
            {/* Name */}
            <TextField
              isRequired
              name="name"
              value={name}
              onChange={setName}
            >
              <Label>Dataset Name</Label>
              <Input placeholder="e.g., Customer Transactions Q4" />
            </TextField>

            {/* Domain + Status row */}
            <div className="grid grid-cols-2 gap-4">
              <Select
                aria-label="Domain"
                placeholder="Select domain"
                selectedKey={domain || null}
                onSelectionChange={(key) => setDomain(key ? String(key) : "")}
              >
                <Label>Domain</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {DOMAINS.map((d) => (
                      <ListBox.Item key={d} id={d} textValue={d}>
                        {d}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>

              <Select
                aria-label="Status"
                placeholder="Select status"
                selectedKey={status || null}
                onSelectionChange={(key) => setStatus(key ? String(key) : "")}
              >
                <Label>Status</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
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

            {/* Owner */}
            <TextField
              isRequired
              name="owner"
              type="email"
              value={owner}
              onChange={setOwner}
            >
              <Label>Owner (Email)</Label>
              <Input placeholder="owner@company.com" />
            </TextField>

            {/* Quality Score Slider */}
            <div>
              <Slider
                minValue={0}
                maxValue={100}
                step={1}
                value={qualityScore}
                onChange={(v) => setQualityScore(v as number)}
                className="slider"
              >
                <div className="flex items-center justify-between">
                  <Label>Quality Score</Label>
                  <Slider.Output className={`font-[family-name:var(--font-geist-mono)] text-sm font-bold tabular-nums ${scoreColor}`} />
                </div>
                <Slider.Track>
                  <Slider.Fill />
                  <Slider.Thumb />
                </Slider.Track>
              </Slider>
              <div className="mt-1 flex justify-between text-[10px] text-muted">
                <span>0</span>
                <span>100</span>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer className="flex gap-3">
            <Button variant="secondary" onPress={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button isDisabled={!canSubmit} onPress={handleSubmit}>
              Create Dataset
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
