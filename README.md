# Chapter Structure Lab — portable source

Chapter Structure Lab includes 81 openings, 101 structural exercises, and 128 mapped scene purposes. This source includes a local chapter-planning extension to the original published export. It runs as static HTML, CSS, and JavaScript. No application login, backend, API key, or npm installation is required.

This package is the current website source. A PWA manifest and offline service worker haven't been added yet. PWA-TASK.md contains a ready-to-use implementation brief for your coding agent in VS Code.

## Plan a chapter

The default view compares three compact treatments: Straightforward, Unexpected, and Experimental. Optional information starts collapsed.

- **Your chapter:** jot down what happens, what changes, and what the reader should feel or wonder. These notes stay intact during rerolls. The app does not analyze your text or generate personalized prose.
- **Purpose & settings:** pick the scene's job and practice scope. All treatments use that purpose. The comparison samples all three ranges; Explore controls the original exercise's rolls.
- **New options:** refresh the comparison without changing the purpose or replacing your selected plan. A free pairing is clearly labeled when a range has no mapped structure. Locked choices are retained even if they fall outside a card's usual range.
- **Details:** reveal reading effects, tradeoffs, information-order and ending choices, and separately expandable beat previews and examples. Guidance is editorial advice for these prose exercises; family-level guidance is labeled.
- **Use this:** select a treatment, then expand **Your selected plan** to rename, add, remove, and reorder beats and add scene notes. Use the buttons to move beats with a mouse or keyboard. Information order and ending are adaptation prompts; changing them does not automatically rewrite or rearrange your beats.
- **Mix treatments:** after selecting a plan, use the buttons inside another treatment's Details to borrow its opening or structure. Replacing a structure's edited beats requires confirmation.
- **Copy plan / Download .txt:** export your chapter notes, the selected treatment, and your actual edited beat sequence. A selectable-text dialog is available when automatic clipboard copying fails.

Changing the comparison's settings leaves the selected plan's purpose, practice scope, and length intact. Replacing an edited plan requires confirmation. The original catalog, direct picks, locks, rolls, and generic exercise copying remain under **Original exercise & full catalog**.

Notes, plans, choices, and locks last only while the page is open. Copy or download what you want to keep; there is no local storage, account, or automatic saving.

## Open in VS Code

Extract this ZIP and open the chapter-structure-lab-source folder.

With Python installed, run from that folder:

```sh
python -m http.server 8000 --directory dist
```

On Windows, use `py` in place of `python` if needed. Visit http://localhost:8000. Stop the server with Ctrl+C. Alternatively, use your preferred static development server with dist as its root.

## Files to edit

- dist/index.html — page layout
- dist/style.css — styling and mobile layout
- dist/app.js — rolls, locks, matching, copying, and interface behavior
- dist/planner.js — comparison candidates, chapter notes, editable plans, and export
- dist/treatment-data.js — editorial reading guidance, information orders, and endings
- dist/data.js — generated openings and structure catalog
- dist/purposes.js — generated purpose catalog and mappings
- purposes.txt — editable purpose definitions and structure IDs
- beats.txt — structure teaching guides and examples
- open-examples.txt — original opening examples
- references/ — original reference documents and parsed source data

To regenerate the catalogs after changing the text sources, run:

```sh
python make-data.py
python assemble.py
python build-purposes.py
```

## GitHub Pages deployment

The workflow in `.github/workflows/deploy-pages.yml` publishes only the contents of `dist/` on pushes to `main`. No build step is needed; the generated catalogs are already included.

1. In the GitHub repository, open **Settings → Pages**.
2. Under **Build and deployment**, change **Source** to **GitHub Actions**.
3. Commit and push the workflow to `main`.
4. Open **Actions → Deploy Chapter Structure Lab** and wait for a successful run. If the workflow was already pushed before changing the Pages setting, use **Run workflow** on `main`.
5. Open the site URL shown under **Settings → Pages** or in the deployment result.

The contents of `dist/` become the website root, so the site URL does not need `/dist/` at the end. Source files and reference documents remain in the repository but are not included in the Pages deployment. Future pushes to `main` update the site automatically.

Upload and deployment run as separate jobs. Each upload attempt has a unique artifact name, passed to the deployment job. If deployment fails after a successful upload, choose **Re-run failed jobs** to retry deployment with that upload. If the artifact has expired (uploads are retained for one day), start a fresh run with **Run workflow** instead. A successful upload alone does not mean the site deployed; the **deploy** job must also succeed.

## Mobile deployment

Publish the contents of dist to your own HTTPS static host without a login gate. The deployment output directory is dist; there is no build step. Publish only dist, rather than the complete project and reference materials.

Your phone accesses the hosted URL. A localhost URL on your computer doesn't become accessible on your phone just by installing the desktop project.

Once the PWA additions are complete, visit the hosted URL on your phone and install/add it to the home screen. Offline operation requires a successful initial online visit and service-worker caching. Keep the host available for first installation and updates.

The tool stores notes, plans, choices, and locks only while the page is open; offline file caching alone won't preserve them between launches. Any future service worker must also cache planner.js and treatment-data.js.

## Check changes

With Node.js installed, run the dependency-free behavior tests:

```sh
node tests/planner.test.cjs
```

The tests exercise matching across all 128 purposes, locks and practice scopes, disclosure-state retention, editing and replacement, mixing treatments, export, escaping user text, and the original exercise controls. They use a small DOM fixture rather than a browser.

Before publishing, also check in a browser:

- At desktop and phone widths, no horizontal scrolling; the three cards stack on phones.
- All details start closed. Tab and Enter/Space operate summaries, buttons, and beat controls.
- Enter chapter notes, choose a treatment, edit a beat, and reroll. The notes and edited plan remain.
- Cancel and accept replacement, including replacing only a structure while retaining the other choices.
- Copy and download a plan; inspect the actual text and beat order. Check the manual-copy fallback if clipboard permission is denied.

The development session could not run Chromium or a preview server because the environment denied the required system operations. Browser layout, native-dialog focus behavior, clipboard permissions, and downloaded files need that final manual check.

## Validation and provenance

The original export came from source commit f474fa20a8595fc4c2c72db55400efc24073b4c4, published version 2, on October 7, 2026. The chapter-planning extension is a local change; the hosted application hasn't been updated. The export excludes hosting identity, source-control metadata, and credentials. One content-generator path was made relative for use on your computer.

References:
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation
