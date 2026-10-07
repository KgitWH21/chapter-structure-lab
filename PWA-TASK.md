Convert this existing static writing tool into a standalone installable PWA.

Preserve its current interface, all 81 openings, all 101 structural exercises, all 128 scene purposes and mappings, and every roll, lock, filter, and copy behavior. Keep the implementation as static HTML/CSS/JavaScript without a backend or authentication. Don't deploy to ChatGPT Sites.

Add:
1. A web app manifest with a stable app ID, name, short name, relative start URL and scope, standalone display, and theme/background colors matching the current design.
2. Local 192px and 512px PNG icons and an Apple touch icon based on the existing simple blue icon. Use appropriate icon purposes and safe padding.
3. A service worker that caches the app shell and complete catalogs for offline use after a successful online visit. Keep paths compatible with both domain-root and subdirectory hosting. Scope cache cleanup to this app. Handle offline navigation, failed fetches, and updated app versions without serving mixed versions or forcing a reload during use.
4. Service-worker registration with nonblocking error handling. Make local development work on localhost and production on HTTPS.
5. Updated README instructions for previewing, deploying the contents of dist to independent static hosting, installing on Android/iPhone, and updating caches when releasing edits.

Don't add cloud accounts, analytics, paid services, or a framework migration. Don't confuse asset caching with saving the user's current selections; keep that behavior as-is unless I request otherwise.

Verify all local asset and manifest paths, online first load, offline reopening after installation, catalog availability, purpose-to-structure matching, locks, copying, and the update flow. Report any browser/device checks you couldn't run. Present the finished source and deployment instructions; wait for my hosting choice before publishing.
