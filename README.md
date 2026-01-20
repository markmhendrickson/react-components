# @markmhendrickson/react-components

Shared React UI components for ateles and neotoma websites.

## Installation

```bash
npm install @markmhendrickson/react-components
```

Or as a git submodule:

```bash
git submodule add git@github.com:markmhendrickson/react-components.git <path>
```

## Usage

### As npm package

```typescript
import { Layout, AppSidebar, ErrorBoundary } from "@markmhendrickson/react-components";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem } from "@markmhendrickson/react-components";
import { cn } from "@markmhendrickson/react-components";
```

### As git submodule

Configure Vite alias in `vite.config.ts`:

```typescript
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "./src/shared"), // or path to submodule
    },
  },
});
```

Then import:

```typescript
import { Layout } from "@shared/components/Layout";
import { AppSidebar } from "@shared/components/AppSidebar";
```

## Components

### Layout

Main layout wrapper with sidebar, breadcrumbs, and scroll position restoration.

```typescript
import { Layout } from "@markmhendrickson/react-components";
import { Home, FileText } from "lucide-react";

<Layout
  siteName="My Site"
  menuItems={[
    { path: "/", label: "Home", icon: Home },
    { path: "/posts", label: "Posts", icon: FileText },
  ]}
  routeNames={{
    posts: "Posts",
    about: "About",
  }}
  getBreadcrumbLabel={(pathname, params) => {
    // Custom logic for dynamic breadcrumb labels
    if (params.slug) {
      return getPostTitle(params.slug);
    }
    return null;
  }}
>
  {children}
</Layout>
```

**Props:**
- `siteName` (string) - Site name displayed in sidebar
- `menuItems` (MenuItem[]) - Navigation menu items
- `routeNames` (Record<string, string>) - Route name mapping for breadcrumbs
- `getBreadcrumbLabel` (function) - Optional function for dynamic breadcrumb labels
- `headerActions` (ReactNode) - Optional header actions (user menu, etc.)

### AppSidebar

Configurable sidebar navigation component.

```typescript
import { AppSidebar } from "@markmhendrickson/react-components";

<AppSidebar
  siteName="My Site"
  menuItems={[
    { path: "/", label: "Home", icon: Home },
    { path: "/posts", label: "Posts", icon: FileText },
  ]}
/>
```

**Props:**
- `siteName` (string) - Site name
- `menuItems` (MenuItem[]) - Array of `{ path, label, icon }` objects

### ErrorBoundary

React error boundary component for catching and displaying errors.

```typescript
import { ErrorBoundary } from "@markmhendrickson/react-components";

<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### UI Components

- `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, etc. - Breadcrumb navigation
- `Button` - Button component
- `Sidebar`, `SidebarProvider`, `SidebarInset`, etc. - Sidebar primitives
- `Calendar`, `Popover` - Additional UI components

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

### Type Check

```bash
npm run type-check
```

### Lint

```bash
npm run lint
```

## Requirements

- React 18+
- React Router DOM 6+
- Lucide React (for icons)
- Tailwind CSS (for styling)

## License

MIT
