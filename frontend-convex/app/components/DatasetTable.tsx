"use client";

import { Table, Chip } from "@heroui/react";
import type { Dataset, Status } from "../types";

interface DatasetTableProps {
  datasets: Dataset[];
}

const statusColorMap: Record<Status, "success" | "warning" | "danger"> = {
  Approved: "success",
  NeedsReview: "warning",
  Rejected: "danger",
};

const statusLabelMap: Record<Status, string> = {
  Approved: "Approved",
  NeedsReview: "Needs Review",
  Rejected: "Rejected",
};

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-success"
      : score >= 60
        ? "bg-warning"
        : "bg-danger";

  return (
    <div className="flex items-center gap-2.5">
      <div className="score-bar-track">
        <div
          className={`score-bar-fill ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="font-[family-name:var(--font-geist-mono)] text-xs font-semibold tabular-nums text-muted">
        {score}
      </span>
    </div>
  );
}

export function DatasetTable({ datasets }: DatasetTableProps) {
  if (datasets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-8 py-16 text-center">
        <div className="mx-auto max-w-sm">
          <div className="mb-3 text-4xl opacity-30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
          <p className="text-sm text-muted">
            No datasets yet. Click <span className="font-semibold text-[var(--accent)]">&quot;+ New Dataset&quot;</span> to create one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--surface-shadow)]">
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Dataset catalog" className="min-w-[700px]">
            <Table.Header>
              <Table.Column isRowHeader>Name</Table.Column>
              <Table.Column>Domain</Table.Column>
              <Table.Column>Owner</Table.Column>
              <Table.Column>Quality</Table.Column>
              <Table.Column>Status</Table.Column>
            </Table.Header>
            <Table.Body>
              {datasets.flatMap((ds) => {
                const rows = [
                  <Table.Row key={ds._id}>
                    <Table.Cell>
                      <span className="font-medium text-[var(--foreground)]">
                        {ds.name}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Chip color="accent" variant="soft" size="sm">
                        {ds.domain}
                      </Chip>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-muted">{ds.owner}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <ScoreBar score={ds.qualityScore} />
                    </Table.Cell>
                    <Table.Cell>
                      <Chip
                        color={statusColorMap[ds.status]}
                        variant="soft"
                        size="sm"
                      >
                        {statusLabelMap[ds.status]}
                      </Chip>
                    </Table.Cell>
                  </Table.Row>,
                ];

                if (ds.qualityScore < 60) {
                  rows.push(
                    <Table.Row key={`${ds._id}-insight`} className="insight-row">
                      <Table.Cell>
                        <div className="flex items-center gap-2 py-0.5 text-xs">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[var(--warning)]">
                            <path d="M12 9v4" />
                            <path d="M12 17h.01" />
                            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          </svg>
                          <span className="italic text-[var(--warning)]">
                            AI Insight: This dataset may require review.
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell />
                      <Table.Cell />
                      <Table.Cell />
                      <Table.Cell />
                    </Table.Row>
                  );
                }

                return rows;
              })}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  );
}
