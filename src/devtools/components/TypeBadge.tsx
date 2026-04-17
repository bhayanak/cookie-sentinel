import type { StorageType } from '@shared/types';
import { STORAGE_TYPE_LABELS, STORAGE_TYPE_COLORS } from '@shared/constants';

interface TypeBadgeProps {
  type: StorageType;
}

function TypeBadge({ type }: TypeBadgeProps) {
  const label = STORAGE_TYPE_LABELS[type];
  const color = STORAGE_TYPE_COLORS[type];

  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
      style={{
        backgroundColor: `${color}20`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  );
}

export default TypeBadge;
