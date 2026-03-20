"use client";

import { useState, useCallback } from "react";
import { Modal, Button, TextField, Label, Input, Select, ListBox, Slider } from "@heroui/react";
import type { Dataset, Status } from "../types";
import { DOMAINS, STATUSES } from "../types";

interface EditDatasetModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dataset: Dataset) => void;
  dataset: Dataset;
}

export function EditDatasetModal({ isOpen, onOpenChange, onSubmit, dataset }: EditDatasetModalProps) {
  const [form, setForm] = useState({
    name: dataset.name,
    domain: dataset.domain,
    owner: dataset.owner,
    qualityScore: dataset.qualityScore,
    status: dataset.status as string,
    details: dataset.details as string,
  });

  const updateField = useCallback(
    <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const canSubmit = form.name.trim() && form.domain && form.owner.trim() && form.status;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      id: dataset.id,
      name: form.name.trim(),
      domain: form.domain,
      owner: form.owner.trim(),
      qualityScore: form.qualityScore,
      status: form.status as Status,
      details: form.details as string,
    });
    onOpenChange(false);
  };

  const scoreColor =
    form.qualityScore >= 80
      ? "text-[var(--success)]"
      : form.qualityScore >= 60
        ? "text-[var(--warning)]"
        : "text-[var(--danger)]";

  return (
      <>

        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} className="modal-backdrop">

          <Modal.Container placement="auto">
            {JSON.stringify(form)}
            <Modal.Dialog className="sm:max-w-lg">
              <Modal.CloseTrigger />

              <Modal.Header>
                <Modal.Heading className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold tracking-tight">
                  Edit Dataset
                </Modal.Heading>
              </Modal.Header>

              <Modal.Body className="flex flex-col gap-5 p-5">
                {/* Name */}
                <TextField isRequired name="name" value={form.name} onChange={(v) => updateField("name", v)}>
                  <Label>Dataset Name</Label>
                  <Input placeholder="e.g., Customer Transactions Q4" />
                </TextField>


                {/* Domain + Status */}
                <div className="grid grid-cols-2 gap-4">
                  <Select
                      aria-label="Domain"
                      placeholder="Select domain"
                      selectedKey={form.domain || null}
                      onSelectionChange={(key) => updateField("domain", key ? String(key) : "")}
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
                      selectedKey={form.status || null}
                      onSelectionChange={(key) => updateField("status", key ? String(key) : "")}
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
                <TextField isRequired name="owner" type="email" value={form.owner} onChange={(v) => updateField("owner", v)}>
                  <Label>Owner (Email)</Label>
                  <Input placeholder="owner@company.com" />
                </TextField>

                {/* Quality Score */}
                <div>
                  <Slider
                      minValue={0}
                      maxValue={100}
                      step={1}
                      value={form.qualityScore}
                      onChange={(v) => updateField("qualityScore", v as number)}
                      className="slider"
                  >
                    <div className="flex items-center justify-between">
                      <Label>Quality Score</Label>
                      <Slider.Output
                          className={`font-[family-name:var(--font-geist-mono)] text-sm font-bold tabular-nums ${scoreColor}`}
                      />
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
                  <TextField isRequired name="details" value={form.details} onChange={(v) => updateField("details", v)}>
                    <Label>Details</Label>
                    <Input placeholder="Edit Details" />
                  </TextField>
                </div>
              </Modal.Body>

              <Modal.Footer className="flex gap-3">
                <Button variant="secondary" onPress={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button isDisabled={!canSubmit} onPress={handleSubmit}>
                  Save Changes
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </>
  );
}
