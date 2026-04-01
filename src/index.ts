/**
 * @markmhendrickson/react-components
 * 
 * Shared React UI components for ateles and neotoma websites
 */

// Types
export type {
  Entity,
  Observation,
  Relationship,
  Schema,
  SchemaField,
  QueryParams,
  PaginatedResponse,
  StatsResponse,
} from "./types/neotoma";

// API
export { get, post, ApiError, BASE_URL } from "./api/client";
export {
  normalizeEntityResponse,
  normalizeEntityTypeKey,
  queryEntities,
  getEntity,
  getEntityObservations,
  getAllEntityObservations,
  getEntityRelationships,
} from "./api/entities";

// Hooks
export { useEntities } from "./hooks/useEntities";
export { useEntity, useEntityRelationships } from "./hooks/useEntity";
export { useObservations } from "./hooks/useObservations";

// Layout components
export { Layout } from "./components/Layout";
export type { LayoutProps } from "./components/Layout";

// Sidebar components
export { AppSidebar } from "./components/AppSidebar";
export type { AppSidebarProps, MenuItem } from "./components/AppSidebar";

// Error boundary
export { default as ErrorBoundary } from "./components/ErrorBoundary";

// Entity components
export { default as WorkflowStatusBadge } from "./components/WorkflowStatusBadge";

// UI components
export * from "./components/ui/badge";
export * from "./components/ui/breadcrumb";
export * from "./components/ui/button";
export * from "./components/ui/calendar";
export * from "./components/ui/card";
export * from "./components/ui/input";
export * from "./components/ui/popover";
export * from "./components/ui/separator";
export * from "./components/ui/sheet";
export * from "./components/ui/sidebar";
export * from "./components/ui/skeleton";
export * from "./components/ui/table";
export * from "./components/ui/tooltip";

// Hooks
export * from "./hooks/use-mobile";

// Lib - Utilities
export { cn } from "./lib/utils";

// Lib - Formatters
export {
  formatDate,
  formatDateShort,
  formatRelativeTime,
  formatNumber,
  snapshotField,
  snapshotPathValue,
  coalesceSnapshot,
} from "./lib/formatters";

// Lib - Humanize
export {
  entityTypeLabel,
  entityDisplayName,
  humanizeRelationshipType,
  humanizeWorkflowStatus,
  workflowStatusBadgeClassName,
  isWorkflowStatusSnapshotKey,
  humanizeSource,
} from "./lib/humanize";

// Lib - Property Labels
export { humanizePropertyKey, splitKeySegments } from "./lib/propertyLabels";
