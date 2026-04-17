import type { CookieClass } from '@shared/types';
import { COOKIE_CLASS_LABELS, COOKIE_CLASS_COLORS } from '@shared/constants';

interface ClassBadgeProps {
  classification: CookieClass;
}

function ClassBadge({ classification }: ClassBadgeProps) {
  const label = COOKIE_CLASS_LABELS[classification];
  const color = COOKIE_CLASS_COLORS[classification];

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

export default ClassBadge;
