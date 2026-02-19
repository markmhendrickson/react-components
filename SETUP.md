# Setup Instructions

## Initial GitHub Repository Setup

1. **Create GitHub Repository:**
   - Go to: https://github.com/new
   - Repository name: `react-components`
   - Description: "Shared React UI components for ateles and neotoma"
   - Set to Private (if needed)
   - **Do NOT** initialize with README, .gitignore, or license
   - Click "Create repository"

2. **Add Remote and Push:**
   ```bash
   cd ~/repos/react-components
   git remote add origin git@github.com:markmhendrickson/react-components.git
   git push -u origin main
   ```

3. **Verify GitHub Actions:**
   - Go to: https://github.com/markmhendrickson/react-components/actions
   - The CI workflow should run automatically on push
   - Verify all checks pass (type-check, lint, build)

## Adding as Submodule to Projects

### Neotoma

```bash
cd /Users/markmhendrickson/repos/neotoma
./scripts/complete_submodule_setup.sh git@github.com:markmhendrickson/react-components.git
```

Or manually:

```bash
cd /Users/markmhendrickson/repos/neotoma
git submodule add git@github.com:markmhendrickson/react-components.git frontend/src/shared
```

### Ateles

```bash
cd /Users/markmhendrickson/repos/ateles

# Remove existing shared directory from git (keep files)
git rm -r --cached execution/website/shared
rm -rf execution/website/shared

# Add as submodule
git submodule add git@github.com:markmhendrickson/react-components.git execution/website/shared
```

## Vite Configuration

### Neotoma (`frontend/vite.config.ts`)

```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
    "@shared": path.resolve(__dirname, "./src/shared"), // Add this
  },
},
```

### Ateles (`vite.config.js`)

```javascript
resolve: {
  alias: {
    '@shared': path.resolve(__dirname, '../shared'),
  },
},
```

## Usage

### Import Components

```typescript
// From submodule
import { Layout, AppSidebar, ErrorBoundary } from "@shared";
import { Breadcrumb, BreadcrumbList } from "@shared";

// Or from npm (if published)
import { Layout, AppSidebar } from "@markmhendrickson/react-components";
```

## Single React Instance (Path Alias / SSR)

When the shared package is consumed via a **path alias** (e.g. `@shared` → `../../shared/src`), do **not** run `npm install` inside the shared directory. React, react-dom, and react-router-dom must be provided by the consuming app so there is only one copy. Otherwise you get "Cannot read properties of null (reading 'useContext')" or "Invalid hook call" in SSR or dev.

- **Correct:** Install only in the app (`react-app/`). Shared code resolves `react` from the app's `node_modules`.
- **Wrong:** Running `npm install` in `shared/` creates `shared/node_modules/react`; the app then uses app's React while shared uses shared's React → duplicate React, broken hooks/context.

If you already ran `npm install` in shared, remove `shared/node_modules` (and optionally `shared/package-lock.json` if you want to avoid reinstalling there). The app's Vite config uses `resolve.dedupe` for react, react-dom, and react-router-dom.

## Development Workflow

1. **Make changes in react-components:**
   ```bash
   cd ~/repos/react-components
   # Make changes
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

2. **Update submodule in consuming projects:**
   ```bash
   cd <project-root>
   cd frontend/src/shared  # or execution/website/shared
   git pull origin main
   cd ../..
   git add frontend/src/shared
   git commit -m "Update react-components submodule"
   ```

## CI/CD

GitHub Actions automatically runs on:
- Push to `main` or `develop` branches
- Pull requests
- Tags (for releases)

Workflows:
- **CI** (`ci.yml`): Type check, lint, build, test
- **Setup** (`setup.yml`): Verify repository setup and configuration
- **Release** (`release.yml`): Publish to npm on version tags
