# React Components Repository

This repository contains shared React UI components used across ateles and neotoma projects.

## Repository Location

- **Local:** `~/repos/react-components`
- **GitHub:** `git@github.com:markmhendrickson/react-components.git`

## GitHub Actions

### CI Workflow (`ci.yml`)

Runs on every push and pull request:
- ✅ TypeScript type checking
- ✅ ESLint linting
- ✅ Build verification
- ✅ Test execution (if tests exist)

### Setup Workflow (`setup.yml`)

Runs on setup changes to verify:
- ✅ Package.json configuration
- ✅ TypeScript configuration
- ✅ Source structure
- ✅ Build output

### Release Workflow (`release.yml`)

Runs on version tags (e.g., `v1.0.0`):
- ✅ Builds the package
- ✅ Publishes to npm (if NPM_TOKEN is configured)

## Next Steps

1. **Create GitHub Repository:**
   - Go to: https://github.com/new
   - Name: `react-components`
   - **Do NOT** initialize with files
   - Create repository

2. **Push to GitHub:**
   ```bash
   cd ~/repos/react-components
   git remote add origin git@github.com:markmhendrickson/react-components.git
   git push -u origin main
   ```

3. **Verify CI:**
   - Check Actions tab: https://github.com/markmhendrickson/react-components/actions
   - All workflows should pass

4. **Add as Submodule:**
   - See `SETUP.md` for detailed instructions
   - Or run: `./scripts/complete_submodule_setup.sh` in neotoma repo
