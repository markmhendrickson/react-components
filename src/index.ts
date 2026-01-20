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
export { default as ErrorBoundary } from "./components/ErrorBoundary";

// UI components
export * from "./components/ui/breadcrumb";
export * from "./components/ui/button";
export * from "./components/ui/calendar";
export * from "./components/ui/input";
export * from "./components/ui/popover";
export * from "./components/ui/separator";
export * from "./components/ui/sheet";
export * from "./components/ui/sidebar";
export * from "./components/ui/skeleton";
export * from "./components/ui/tooltip";

// Hooks
export * from "./hooks/use-mobile";

// Utilities
export { cn } from "./lib/utils";
