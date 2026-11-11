import type { ReactNode } from 'react';
import type { IconName } from '@/lib/types';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  title?: string;
  strokeWidth?: number;
}

const PATHS: Record<IconName, ReactNode> = {
  status: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
      <path d="M12 2.5v2.7M12 18.8v2.7M2.5 12h2.7M18.8 12h2.7" />
    </>
  ),
  gate: (
    <>
      <path d="M4.5 20.5V10a7.5 7.5 0 0 1 15 0v10.5" />
      <path d="M8 20.5v-9.8a4 4 0 0 1 8 0v9.8" />
      <path d="M4.5 20.5h15" />
    </>
  ),
  sword: (
    <>
      <path d="M5 19L17 7" />
      <path d="M19 5l-2 2" />
      <path d="M14.5 4.5h5v5" />
      <path d="M5 19l-1.5-1.5M5 19l1.5 1.5M8.5 12.5l3 3M12 9l3 3" />
      <path d="M4 20l2-2" />
    </>
  ),
  log: (
    <>
      <path d="M6 3.5h9l4 4v13H6z" />
      <path d="M15 3.5v4h4" />
      <path d="M9 11h7M9 14.5h7M9 18h4.5" />
    </>
  ),
  analytics: (
    <>
      <path d="M4 20.5h16" />
      <path d="M7 20.5V15M12 20.5V9M17 20.5V4.5" />
      <path d="M5 9.5l4.5-3.5 3.5 2L19 3.5" />
    </>
  ),
  system: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  arrow: (
    <>
      <path d="M4 12h15" />
      <path d="M14 7l5 5-5 5" />
    </>
  ),
  check: <path d="M4.5 12.5c1.7 1.4 3.1 3 4.6 4.6 3.4-4.2 7-7.5 10.4-10.7" />,
  chevron: <path d="M7 10l5 5 5-5" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  edit: (
    <>
      <path d="M4 20l4.6-1 10-10-3.6-3.6-10 10z" />
      <path d="M13 6.5L17.5 11" />
    </>
  ),
  trash: (
    <>
      <path d="M5 7h14" />
      <path d="M9 7V4.5h6V7" />
      <path d="M7 7l1 13h8l1-13" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11" />
      <path d="M7.5 10.5L12 15l4.5-4.5" />
      <path d="M5 19.5h14" />
    </>
  ),
  upload: (
    <>
      <path d="M12 15V4" />
      <path d="M7.5 8.5L12 4l4.5 4.5" />
      <path d="M5 19.5h14" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 1 0-2.4 6.4" />
      <path d="M20 5v6h-6" />
    </>
  ),
  spark: <path d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.2l3.5 2" />
    </>
  ),
  flame: (
    <path d="M12 3c1 4 5 5.4 5 9.5a5 5 0 0 1-10 0c0-2 1-3.5 2.2-4.8.3 1.8.9 2.8 1.8 3.3.1-3.2.3-5.8 1-8z" />
  ),
  star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.8L12 16.8l-5.3 2.8 1.1-5.8L3.5 9.7l5.9-.8z" />,
  hourglass: (
    <>
      <path d="M7 3.5h10M7 20.5h10" />
      <path d="M8 3.5c0 4 4 5.5 4 8.5s-4 4.5-4 8.5M16 3.5c0 4-4 5.5-4 8.5s4 4.5 4 8.5" />
    </>
  ),
  book: (
    <>
      <path d="M4.5 5.5c3-1.2 5.5-.8 7.5 1 2-1.8 4.5-2.2 7.5-1v13c-3-1.2-5.5-.8-7.5 1-2-1.8-4.5-2.2-7.5-1z" />
      <path d="M12 6.5v13" />
    </>
  ),
  crown: (
    <>
      <path d="M4.5 18h15" />
      <path d="M5.5 8.5l3.5 3L12 5l3 6.5 3.5-3L17 16.5H7z" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
    </>
  ),
  moon: <path d="M19 14.5A8 8 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" />,
  scroll: (
    <>
      <path d="M6 4.5h11a2 2 0 0 1 2 2v11.5a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2z" />
      <path d="M9 8h7M9 11.5h7M9 15h4" />
    </>
  ),
  quill: (
    <>
      <path d="M20 4c-6 0-10 3-12 8l-3 7 7-3c5-2 8-6 8-12z" />
      <path d="M5 19l6-6" />
    </>
  ),
  shield: <path d="M12 3l7 2.5v6c0 4.5-3 7.5-7 9.5-4-2-7-5-7-9.5v-6z" />,
  skull: (
    <>
      <path d="M12 3.5c-4.4 0-7 2.9-7 7 0 2.6 1.2 4.4 2.5 5.5v3.5h9v-3.5c1.3-1.1 2.5-2.9 2.5-5.5 0-4.1-2.6-7-7-7z" />
      <circle cx="9" cy="11" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11" r="1.4" fill="currentColor" stroke="none" />
      <path d="M10.5 16v2M13.5 16v2" />
    </>
  ),
  diamond: <path d="M12 3.5L20.5 12 12 20.5 3.5 12z" />,
  circle: <circle cx="12" cy="12" r="8" />,
  half: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8 12.2l2.8 2.8L16.5 9" />
    </>
  ),
  folder: <path d="M3.5 6.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />,
  list: (
    <>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <circle cx="4.5" cy="6" r=".9" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r=".9" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r=".9" fill="currentColor" stroke="none" />
    </>
  ),
  card: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="1" />
      <path d="M7 10h7M7 13.5h10" />
    </>
  ),
  stamp: (
    <>
      <path d="M5 20h14" />
      <path d="M7 17h10v-2.5H7z" />
      <path d="M9.5 14.5V10a2.5 2.5 0 1 1 5 0v4.5" />
    </>
  ),
  sound: (
    <>
      <path d="M4 9.5h3l4-3v11l-4-3H4z" />
      <path d="M15 9a4 4 0 0 1 0 6M17.5 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  mute: (
    <>
      <path d="M4 9.5h3l4-3v11l-4-3H4z" />
      <path d="M15 9.5l4 5M19 9.5l-4 5" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.7 9.4a2.4 2.4 0 1 1 3.6 2.1c-.8.5-1.3 1-1.3 1.9" />
      <circle cx="12" cy="17" r=".9" fill="currentColor" stroke="none" />
    </>
  )
};

export function Icon({ name, size = 18, className, title, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {PATHS[name] ?? PATHS.star}
    </svg>
  );
}
