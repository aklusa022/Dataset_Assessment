import useSWR from "swr";
import type { Dataset } from "../types";

const fetcher = (url: string): Promise<Dataset[]> =>
  fetch(url).then((res) => res.json());

export function useDatasets() {
  const { data, error, isLoading, mutate } = useSWR("/api/datasets", fetcher);

  const createDataset = async (dataset: Omit<Dataset, "id">) => {
    const newDataset: Dataset = {
      ...dataset,
      id: crypto.randomUUID(),
    };

    // Optimistic update — add to local cache immediately
    await mutate(
      async (current) => {
        const res = await fetch("/api/datasets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newDataset),
        });

        if (!res.ok) throw new Error(`Failed to create dataset: ${res.statusText}`);

        const created: Dataset = await res.json();
        return [...(current ?? []), created];
      },
      { optimisticData: [...(data ?? []), newDataset], rollbackOnError: true }
    );
  };

  const updateDataset = async (dataset: Dataset) => {
    const optimisticData = (data ?? []).map((d) =>
      d.id === dataset.id ? dataset : d
    );

    await mutate(
      async (current) => {
        const res = await fetch("/api/datasets", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataset),
        });

        if (!res.ok) throw new Error(`Failed to update dataset: ${res.statusText}`);

        const updated: Dataset = await res.json();
        return (current ?? []).map((d) => (d.id === updated.id ? updated : d));
      },
      { optimisticData, rollbackOnError: true }
    );
  };

  return {
    datasets: data ?? [],
    isLoading,
    error,
    createDataset,
    updateDataset,
  };
}
