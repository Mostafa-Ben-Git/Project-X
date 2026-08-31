/**
 * Project-X Logo System — Optimized v2 (not a close button)
 * Problem: thin X in a square reads as “close/dismiss” (×).
 * Fix: X is now two overlapping pill-shaped chat bubbles (mass, not lines)
 *      + central hub (social graph) — never used in close icons.
 *      Pill = 6.8×17 capsule, rx=3.4, rotated ±34° → reads as bubble at large size,
 *      collapses to bold X at 16px favicon, but always thick/mass vs thin stroke.
 */
import { cn } from "@/lib/utils";

// ── Core Icon (32×32 viewBox) ──
export function LogoIcon({ size = 32, className, variant = "default", ...props }) {
  const variants = {
    default: {
      bg: "hsl(var(--primary))",
      pill: "white",
      hubOuter: "white",
      hubInner: "hsl(var(--primary))",
    },
    sidebar: {
      bg: "hsl(var(--sidebar-primary))",
      pill: "hsl(var(--sidebar-primary-foreground))",
      hubOuter: "hsl(var(--sidebar-primary-foreground))",
      hubInner: "hsl(var(--sidebar-primary))",
    },
    inverted: {
      bg: "white",
      pill: "hsl(var(--primary))",
      hubOuter: "hsl(var(--primary))",
      hubInner: "white",
    },
    mono: null,
  };

  if (variant === "mono") {
    return <LogoMark size={size} className={className} {...props} />;
  }

  const v = variants[variant] ?? variants.default;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Project-X logo"
      className={cn("shrink-0 select-none", className)}
      {...props}
    >
      <rect width="32" height="32" rx="8" fill={v.bg} />
      {/* Two pill-shaped chat bubbles forming X — mass, not thin lines */}
      <g transform="rotate(34 16 16)">
        <rect x="12.6" y="7.5" width="6.8" height="17" rx="3.4" fill={v.pill} />
      </g>
      <g transform="rotate(-34 16 16)">
        <rect x="12.6" y="7.5" width="6.8" height="17" rx="3.4" fill={v.pill} />
      </g>
      {/* Center hub — social graph connection (never in close icons) */}
      <circle cx="16" cy="16" r="3" fill={v.hubOuter} />
      <circle cx="16" cy="16" r="1.45" fill={v.hubInner} />
    </svg>
  );
}

// ── Minimal mark (no background) — use via currentColor ──
export function LogoMark({ size = 32, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Project-X mark"
      className={cn("shrink-0 text-primary", className)}
      {...props}
    >
      <g transform="rotate(34 16 16)">
        <rect x="12.6" y="7.5" width="6.8" height="17" rx="3.4" fill="currentColor" />
      </g>
      <g transform="rotate(-34 16 16)">
        <rect x="12.6" y="7.5" width="6.8" height="17" rx="3.4" fill="currentColor" />
      </g>
      <circle cx="16" cy="16" r="3" fill="currentColor" />
      <circle cx="16" cy="16" r="1.45" fill="hsl(var(--background))" />
    </svg>
  );
}

// ── Wordmark ──
export function LogoWordmark({ className, size = "default", variant = "default", ...props }) {
  const sizeClasses = {
    sm: "text-base",
    default: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };
  const isInverted = variant === "inverted";
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-bold tracking-tight select-none whitespace-nowrap",
        sizeClasses[size] ?? sizeClasses.default,
        className
      )}
      {...props}
    >
      <span className={cn("font-semibold tracking-tight", isInverted ? "text-primary-foreground" : "text-foreground")}>
        Project
      </span>
      <span className={cn("font-black tracking-tighter", isInverted ? "text-primary-foreground" : "text-primary")}>
        -X
      </span>
    </span>
  );
}

// ── Full lockup: icon + wordmark ──
export function Logo({
  size = 32,
  iconSize,
  showWordmark = true,
  wordmarkSize = "default",
  variant = "default",
  className,
  wordmarkClassName,
  orientation = "horizontal",
  ...props
}) {
  const _iconSize = iconSize ?? size;
  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "flex items-center",
        isVertical ? "flex-col gap-2" : "flex-row gap-2.5",
        className
      )}
      {...props}
    >
      <LogoIcon size={_iconSize} variant={variant} />
      {showWordmark && <LogoWordmark size={wordmarkSize} variant={variant} className={wordmarkClassName} />}
    </div>
  );
}

export function SidebarLogo({ collapsed = false }) {
  if (collapsed) {
    return <LogoIcon size={36} variant="sidebar" className="h-9 w-9" />;
  }
  return <Logo size={32} variant="sidebar" wordmarkSize="default" />;
}

export default Logo;
