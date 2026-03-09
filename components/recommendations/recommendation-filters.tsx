'use client';

import type { Market } from '@/types/markets';
import type { RiskLevel, RecommendationStatus } from '@/types/recommendations';
import { getTypeLabel } from '@/lib/recommendation-helpers';

interface RecommendationFiltersProps {
  selectedMarket: Market | 'all';
  selectedRisk: RiskLevel | 'all';
  selectedType: string | 'all';
  selectedStatus: RecommendationStatus | 'all';
  onMarketChange: (market: Market | 'all') => void;
  onRiskChange: (risk: RiskLevel | 'all') => void;
  onTypeChange: (type: string | 'all') => void;
  onStatusChange: (status: RecommendationStatus | 'all') => void;
  recommendationTypes: string[];
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[10px] uppercase tracking-[0.14em] text-text-dim font-medium"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          appearance-none bg-surface-700/60 border border-surface-500/40
          rounded-lg px-3 py-2 text-sm text-text-secondary
          hover:border-surface-400/60 focus:border-accent-brand/50
          transition-colors duration-200 cursor-pointer
          bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')]
          bg-[position:right_10px_center] bg-no-repeat pr-8
        "
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function RecommendationFilters({
  selectedMarket,
  selectedRisk,
  selectedType,
  selectedStatus,
  onMarketChange,
  onRiskChange,
  onTypeChange,
  onStatusChange,
  recommendationTypes,
}: RecommendationFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <FilterSelect
        label="Market"
        value={selectedMarket}
        onChange={(v) => onMarketChange(v as Market | 'all')}
        options={[
          { value: 'all', label: 'All Markets' },
          { value: 'spokane', label: 'Spokane' },
          { value: 'kootenai', label: 'Kootenai' },
        ]}
      />

      <FilterSelect
        label="Risk Level"
        value={selectedRisk}
        onChange={(v) => onRiskChange(v as RiskLevel | 'all')}
        options={[
          { value: 'all', label: 'All Levels' },
          { value: 'green', label: 'Low Risk' },
          { value: 'yellow', label: 'Moderate' },
          { value: 'red', label: 'High Risk' },
        ]}
      />

      <FilterSelect
        label="Type"
        value={selectedType}
        onChange={(v) => onTypeChange(v)}
        options={[
          { value: 'all', label: 'All Types' },
          ...recommendationTypes.map((t) => ({
            value: t,
            label: getTypeLabel(t),
          })),
        ]}
      />

      <FilterSelect
        label="Status"
        value={selectedStatus}
        onChange={(v) => onStatusChange(v as RecommendationStatus | 'all')}
        options={[
          { value: 'all', label: 'All Statuses' },
          { value: 'pending', label: 'Pending' },
          { value: 'approved', label: 'Approved' },
          { value: 'testing', label: 'Testing' },
          { value: 'ignored', label: 'Ignored' },
          { value: 'implemented', label: 'Implemented' },
        ]}
      />
    </div>
  );
}
