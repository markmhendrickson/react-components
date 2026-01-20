/**
 * @markmhendrickson/react-components
 * 
 * Shared React UI components for ateles and neotoma websites
 */

// Layout components
export { Layout } from "./components/Layout";
export type { LayoutProps } from "./components/Layout";

// Sidebar components
export { AppSidebar } from "./components/AppSidebar";
export type { AppSidebarProps, MenuItem } from "./components/AppSidebar";

// Error boundary
export { ErrorBoundary } from "./components/ErrorBoundary";

// UI components
export * from "./components/ui/breadcrumb";
export * from "./components/ui/button";
export * from "./components/ui/sidebar";
export * from "./components/ui/calendar";
export * from "./components/ui/popover";

// Utilities
export { cn } from "./lib/utils";
