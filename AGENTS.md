This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Absolute Rules (Mandatory & Non-Negotiable)

These rules are strictly enforced and take precedence over all general habits. No code may be written or modified without complying with these gates:

1. **Pre-Flight Project Specification Gate**:
   - **NEVER** write or modify code from memory or assumptions.
   - **ALWAYS** read and strictly follow the project specification documents before beginning any coding task:
     - `docs/CONTEXT.md` (Domain background, UBD branding, and visual identity)
     - `docs/PRD.md` (Product requirements, personas, and feature scopes)
     - `docs/REQUIREMENTS.md` (Functional & non-functional requirements and Gherkin acceptance criteria)
     - `docs/SYSTEM-DESIGN.md` (System architecture, navigation graph, data contracts, and sequence diagrams)
     - `docs/DEVELOPMENT-GUIDE.md` (Phased milestones and QA verification checklist)
     - `GLOSSARY.md` (Canonical domain terminology)
     - `docs/adr/*.md` (Architectural decisions)

2. **Mandatory MCP `context7` Documentation Lookup**:
   - **NEVER** trust model training weights for Expo, React Native, or third-party library APIs.
   - **ALWAYS** query the `context7` MCP server before implementing any library, API, hook, or component:
     - Step 1: Call `resolve-library-id` with the library name (e.g. `@react-native-async-storage/async-storage`, `expo-router`, `react-native`).
     - Step 2: Call `query-docs` with the specific topic to retrieve official, up-to-date documentation and code patterns.
   - Never write code based on stale or assumed API signatures.

3. **Mandatory Skills Utilization**:
   - **ALWAYS** inspect and follow the relevant skills before and during implementation:
     - Expo & React Native: `expo-overview`, `expo-router`, `expo-native-ui`, `expo-design-system`, `expo-data-fetching`.
     - Code Quality & Engineering: `codebase-design`, `code-review`, `tdd`, or other relevant skills in `.agents/skills/`.
   - Never bypass or ignore applicable skill instructions.

4. **Mandatory Application Version Synchronization Gate (SemVer & Release Hygiene)**:
   - **ALWAYS** increment and synchronize the application release version across all config files and UI every time a feature is added, bug is fixed, or architectural change is introduced:
     - `package.json`: bump `"version"` following Semantic Versioning (`MAJOR.MINOR.PATCH`).
     - `app.json`: synchronize `expo.version` (`"X.Y.Z"`), increment `expo.android.versionCode` (`integer`), and update `expo.ios.buildNumber` (`"X.Y.Z"`).
     - UI Release Indicator: update version labels in settings screen (`src/app/pengaturan/index.tsx`) or headers to match the bumped version.
   - **SemVer Increment Criteria**:
     - **PATCH** (`+0.0.1`): Bug fixes, hotfixes, security patches, styling/typo adjustments, refactorings without new features.
     - **MINOR** (`+0.1.0`): New user-facing features, new screens/routes, new services, or backward-compatible capabilities.
     - **MAJOR** (`+1.0.0`): Breaking changes, major milestone phase deliverables (e.g., V2, V3, V4), database migration versions.
   - **NEVER** finish a coding task, commit, or push code with stale, mismatched, or neglected version numbers.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
bun test                    # run automated test suite
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run tests (`bun test`), lint (`npx expo lint`), typecheck (`npx tsc --noEmit`), and verify version synchronization before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
