"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@heroui/react";
import type { Dataset } from "./types";
import { DatasetTable } from "./components/DatasetTable";
import { CreateDatasetModal } from "./components/CreateDatasetModal";
import { Filters } from "./components/Filters";

export default function Home() {
  const datasets = useQuery(api.datasets.list) ?? [];
  const createDataset = useMutation(api.datasets.create);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleCreate = async (dataset: Omit<Dataset, "_id" | "_creationTime">) => {
    await createDataset({
      name: dataset.name,
      domain: dataset.domain,
      owner: dataset.owner,
      qualityScore: dataset.qualityScore,
      status: dataset.status,
    });
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

      {/* Create Modal */}
      <CreateDatasetModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}
