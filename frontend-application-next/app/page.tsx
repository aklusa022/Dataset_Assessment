"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, toast } from "@heroui/react";
import type { Dataset } from "./types";
import { DatasetTable } from "./components/DatasetTable";
import { CreateDatasetModal } from "./components/CreateDatasetModal";
import { Filters } from "./components/Filters";

export default function Home() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [domainFilter, setDomainFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetch("/api/datasets")
      .then((res) => res.json())
      .then((data) => setDatasets(data as Dataset[]))
      .catch(console.error);
  }, []);

  const uniqueDomains = useMemo(
    () => [...new Set(datasets.map((d) => d.domain))],
    [datasets]
  );

  const filteredDatasets = useMemo(() => {
    return datasets.filter((d: any) => {
      const matchesDomain = !domainFilter || d.domain === domainFilter;
      const matchesStatus = !statusFilter || d.status === statusFilter;
      return matchesDomain && matchesStatus;
    });
  }, [datasets, domainFilter, statusFilter]);

  const handleCreate = (dataset: Omit<Dataset, "id">) => {
    const newDataset: Dataset = {
      ...dataset,
      id: crypto.randomUUID(),
    };
    setDatasets((prev) => [...prev, newDataset]);
    toast.success("Dataset created successfully");
  };

  const handleDomainChange = (value: string) => {
    setDomainFilter(value === "__all" ? "" : value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value === "__all" ? "" : value);
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
          <Button onPress={() => setIsModalOpen(true)}>
            + New Dataset
          </Button>
        </header>

        {/* Filters */}
        <Filters
          domains={uniqueDomains}
          domainFilter={domainFilter}
          onDomainChange={handleDomainChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
        />

        {/* Table */}
        <DatasetTable datasets={filteredDatasets} />
      </div>

      <CreateDatasetModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}
