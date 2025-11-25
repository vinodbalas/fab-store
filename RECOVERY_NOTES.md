# Cogniclaim Recovery Build (Nov 2025)

This folder now contains a **minimal but runnable reconstruction** of Cogniclaim, based on:

- The file inventory stored in `anysphere.cursor-retrieval/embeddable_files.txt`
- Cursor's `User/History` snapshots (copied to `/Users/apple/cogniclaim_history_dump`)
- Manual placeholders for files whose source was not recoverable

## What is included

- Vite + React + Tailwind scaffolding that matches the original dependency graph
- Core contexts (`AuthContext`, `DemoModeContext`) with fake data so you can browse the UI
- Recreated layout, navigation, FAB store flow, and placeholder screens for every surface referenced in the chat history

## What is missing

- Detailed UI/logic for each component
- Backend (`backend/`), data stubs, AI agents, and automation scripts
- Assets (videos, SVGs, scripts) that existed outside Cursor's local history

## How to continue the restoration

1. The snapshots under `/Users/apple/cogniclaim_history_dump/**` hold the *real* code you edited in Cursor. Copy each file into the new `src/` / `backend/` structure, renaming it according to the file list in `embeddable_files.txt`.
2. Replace the placeholder screens in `src/components/` with the recovered versions.
3. Rebuild the backend folder (see the dependency list in `package.json` and the LangChain/Express references in the history dump).

## Running the app

```bash
cd /Users/apple/cogniclaim
npm install
npm run dev
```

If `npm install` fails on this machine (sandbox restrictions), run the commands manually in your terminal outside Cursor.

## Reference

- History backup: `/Users/apple/cogniclaim_history_dump`
- File inventory: `~/Library/Application Support/Cursor/User/workspaceStorage/26f2e4005ccda43f497f769efb6b9bbc/anysphere.cursor-retrieval`

Documented by Cursor recovery helper — Nov 25, 2025.

