"use client";

import { useMemo, useState } from "react";
import { Button, toast } from "@heroui/react";
import type { Dataset } from "./types";
import { useDatasets } from "./hooks/useDatasets";
import { DatasetTable } from "./components/DatasetTable";
import { CreateDatasetModal } from "./components/CreateDatasetModal";
import { EditDatasetModal } from "./components/EditDatasetModal";
import { Filters } from "./components/Filters";

export default function Home() {
  const { datasets, isLoading, createDataset, updateDataset } = useDatasets();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
  const [domainFilter, setDomainFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const uniqueDomains = useMemo(
    () => [...new Set(datasets.map((d) => d.domain))],
    [datasets]
  );

  const filteredDatasets = useMemo(() => {
    return datasets.filter((d) => {
      const matchesDomain = !domainFilter || d.domain === domainFilter;
      const matchesStatus = !statusFilter || d.status === statusFilter;
      return matchesDomain && matchesStatus;
    });
  }, [datasets, domainFilter, statusFilter]);

  const handleCreate = async (dataset: Omit<Dataset, "id">) => {
    try {
      await createDataset(dataset);
      toast.success("Dataset created successfully");
    } catch {
      toast.danger("Failed to create dataset. Please try again.");
    }
  };

  const handleUpdate = async (dataset: Dataset) => {
    try {
      await updateDataset(dataset);
      toast.success("Dataset updated successfully");
    } catch {
      toast.danger("Failed to update dataset. Please try again.");
    }
  };

  return (
    <div className="relative z-10 min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <header className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              StewardIQ
            </p>
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-4xl">
              Dataset Catalog
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              Monitor and manage your organization&apos;s data assets
            </p>
          </div>
          <Button onPress={() => setIsCreateModalOpen(true)}>+ New Dataset</Button>
        </header>

        {/* Filters */}
        <Filters
          domains={uniqueDomains}
          domainFilter={domainFilter}
          onDomainChange={(v) => setDomainFilter(v === "__all" ? "" : v)}
          statusFilter={statusFilter}
          onStatusChange={(v) => setStatusFilter(v === "__all" ? "" : v)}
        />

        {/* Table */}
        <DatasetTable
          datasets={filteredDatasets}
          isLoading={isLoading}
          onEdit={(ds) => setEditingDataset(ds)}
        />
      </div>

      <CreateDatasetModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreate}
      />

      {editingDataset && (
        <EditDatasetModal
          key={editingDataset.id}
          isOpen
          onOpenChange={(open) => { if (!open) setEditingDataset(null); }}
          onSubmit={handleUpdate}
          dataset={editingDataset}
        />
      )}
    </div>
  );
}
