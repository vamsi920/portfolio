# Deploy to Vercel

## Current state

- **Commit for this release:** `2377980`  
  (`feat: add Features #8–#10 (sound feedback, attention mode, Amaze demo) and full React migration`)
- **Branch:** `master` (pushed to `origin`)
- **Config:** `vercel.json` added (build: `npm run build`, output: `dist`, SPA rewrites)

## One-time: Vercel auth

1. In this repo directory run:
   ```bash
   npx vercel login
   ```
2. Open the URL it prints and complete the browser login.
3. When it says “Success! Authentication complete”, you can close the tab.

## Deploy production

From the repo root:

```bash
npx vercel --prod --yes
```

- First run may ask to link/create a project; accept defaults (or choose existing Vercel project).
- When it finishes it will print the **production URL** (e.g. `https://portfolio-xxx.vercel.app` or your custom domain).

## Deployments and commit hash

- Deploying from this repo with `vercel --prod` deploys the current **HEAD** of `master`.
- For the release that includes Features #8–#10, that commit is **`2377980`**.
- In the Vercel dashboard: Project → Deployments → select the latest production deployment to see the commit (e.g. `2377980`) and the exact production URL.

## Optional: GitHub → Vercel

1. Go to [vercel.com](https://vercel.com) → Add New → Project.
2. Import `vamsi920/portfolio` from GitHub.
3. Leave build/output as detected (Vite); add SPA rewrites if needed (or rely on `vercel.json` in the repo).
4. Deploy; production URL will be on the project’s dashboard and tied to the commit Vercel built (e.g. `2377980` after the next deploy from `master`).
