# DocMind Frontend - Corrected

This frontend has been refactored to remove the problematic nested component structure
and to use explicit, React-safe effect callbacks.

## Run

Open PowerShell in this `frontend` directory:

```powershell
npm install
npm run dev
```

Then open:

http://localhost:3000

The backend should normally be running at:

http://127.0.0.1:8000

If the backend uses another URL, create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## If an old Next.js cache exists

Stop the dev server with Ctrl+C, then run:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

## Important

Do not use `useEffect(async () => { ... })`.

All async work in this version is declared inside the effect and invoked with `void`.
Effects that own timers also return a real cleanup function.

The project intentionally keeps Next.js 16.3.0 and React 19.2.8 from the supplied
project instead of changing framework versions without evidence that a version change
is required.
