# Development Tools Setup Guide

This project now has a comprehensive suite of development tools configured to ensure code quality, consistency, and best practices.

## 🛠️ Installed Tools

### 1. **Prettier** - Code Formatter

- **Purpose**: Automatic code formatting for consistent style
- **Configuration**: `.prettierrc`
- **Commands**:
  - `pnpm format` - Format all files
  - `pnpm format:check` - Check formatting without changes
- **Features**:
  - Semi-colons enabled
  - Single quotes
  - 2-space tabs
  - Trailing commas (ES5)
  - 100 character print width
  - Tailwind CSS class sorting via plugin

### 2. **ESLint** - Code Quality & Linting

- **Purpose**: Catch bugs, enforce best practices, find problematic patterns
- **Configuration**: `eslint.config.js` (flat config format for ESLint 9)
- **Commands**:
  - `pnpm lint` - Run linter
  - `pnpm lint:fix` - Auto-fix fixable issues
- **Plugins**:
  - `@typescript-eslint` - TypeScript support
  - `eslint-plugin-react` - React-specific rules
  - `eslint-plugin-react-hooks` - React Hooks rules
  - `@next/eslint-plugin-next` - Next.js specific rules
  - `eslint-config-prettier` - Disable conflicting Prettier rules

### 3. **Husky** - Git Hooks Manager

- **Purpose**: Run checks automatically before commits
- **Configuration**: `.husky/` directory
- **Hooks**:
  - `pre-commit` - Runs lint-staged on staged files
  - `commit-msg` - Validates commit message format with commitlint
- **Setup**: Automatically initialized via `prepare` script in package.json

### 4. **lint-staged** - Pre-commit Linting

- **Purpose**: Run linters only on staged files for faster pre-commit checks
- **Configuration**: `package.json` → `lint-staged`
- **Workflow**:
  - On `.ts,.tsx,.js,.jsx` files: ESLint fix → Import Sort → Prettier
  - On `.json,.md,.yml,.yaml` files: Prettier only

### 5. **Commitlint** - Commit Message Convention

- **Purpose**: Enforce conventional commit message format
- **Configuration**: `commitlint.config.js`
- **Format**: `type(subject): description`
- **Allowed Types**:
  - `feat` - New feature
  - `fix` - Bug fix
  - `docs` - Documentation changes
  - `style` - Code style changes (formatting, missing semi-colons, etc.)
  - `refactor` - Code refactoring
  - `perf` - Performance improvements
  - `test` - Adding/updating tests
  - `build` - Build system changes
  - `ci` - CI/CD configuration changes
  - `chore` - Other changes (maintenance tasks)
  - `revert` - Reverting previous commits
- **Rules**:
  - Type must be lowercase
  - Subject cannot be empty
  - Max subject length: 100 characters

### 6. **EditorConfig** - Editor Consistency

- **Purpose**: Maintain consistent coding styles across different editors and IDEs
- **Configuration**: `.editorconfig`
- **Settings**:
  - UTF-8 charset
  - Space indentation (2 spaces)
  - LF line endings
  - Insert final newline
  - Trim trailing whitespace
- **Command**: `pnpm editorconfig` - Check compliance

### 7. **Import Sort** - Import Organization

- **Purpose**: Automatically sort and organize import statements
- **Configuration**: `.importsortrc.json`
- **Parser**: Babylon (Babel parser)
- **Style**: Module style
- **Integration**: Runs as part of `pnpm format` and pre-commit hooks

## 📋 Available NPM Scripts

```bash
# Development
pnpm dev          # Start development server on port 3001
pnpm build        # Build for production
pnpm start        # Start production server
pnpm clean        # Remove .next build directory

# Code Quality
pnpm lint         # Run ESLint
pnpm lint:fix     # Run ESLint with auto-fix
pnpm format       # Format code with Prettier + Import Sort
pnpm format:check # Check formatting without changes
pnpm editorconfig # Check EditorConfig compliance
pnpm typecheck    # TypeScript type checking

# Git Hooks
pnpm prepare      # Initialize Husky (runs automatically after pnpm install)
```

## 🔄 Typical Workflow

### 1. **During Development**

```bash
# Your code is automatically formatted on save if your editor supports it
# Or manually format:
pnpm format

# Check for linting issues:
pnpm lint
```

### 2. **Before Committing**

The pre-commit hook automatically runs:

- ESLint (with auto-fix)
- Import Sort
- Prettier

You don't need to do anything manually!

### 3. **Making Commits**

Use conventional commit format:

```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login redirect issue"
git commit -m "docs: update API documentation"
```

If your commit message doesn't follow the convention, commitlint will reject it.

## 🎯 Benefits

1. **Consistent Code Style**: All team members use the same formatting rules
2. **Early Bug Detection**: ESLint catches common mistakes before runtime
3. **Clean Git History**: Conventional commits make changelogs auto-generatable
4. **Automated Quality Checks**: Pre-commit hooks ensure nothing bad gets committed
5. **Better Collaboration**: Everyone's editor behaves the same way
6. **Professional Standards**: Industry-best practices enforced automatically

## 🔧 IDE Integration

For the best experience, install these extensions in VS Code:

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **EditorConfig** (`editorconfig.editorconfig`)

Then enable format on save in VS Code settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  }
}
```

## 🚀 Next Steps

Your development environment is now fully configured! The tools will:

- ✅ Auto-format code on commit
- ✅ Catch bugs and anti-patterns
- ✅ Enforce commit message standards
- ✅ Maintain consistent editor behavior
- ✅ Organize imports automatically

Happy coding! 🎉
