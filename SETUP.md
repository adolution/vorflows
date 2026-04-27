# SETUP — New Website from this Template

This template gives you a static-HTML scaffold with a local dev server, screenshot tooling, and Claude Code rules. Use it as the starting point for any new website. Each new website = new GitHub repo + new Vercel project.

---

## 1. What's in this template

```
.
├── .claude/              # Claude Code settings & skills (keep)
├── .gitignore
├── CLAUDE.md             # Rules Claude follows when designing
├── SETUP.md              # This file
├── index.html            # Empty stub — replace with your homepage
├── node_modules/         # Installed deps (puppeteer)
├── package.json
├── package-lock.json
├── screenshot.mjs        # Screenshot tool (uses puppeteer)
└── serve.mjs             # Static server on localhost:3000
```

You build your website by editing `index.html` (and adding more HTML/CSS/JS files as needed). The dev server serves the project root as static files.

---

## 2. Verify the local toolchain works

Before doing anything else:

```bash
node serve.mjs
```

Open `http://localhost:3000` — you should see the "Template ready." stub. Stop the server with `Ctrl+C`.

Test screenshots (server must be running in another terminal or background):

```bash
node screenshot.mjs http://localhost:3000
```

Output goes to `./temporary screenshots/screenshot-N.png`.

If `node_modules/` is missing or puppeteer fails:

```bash
npm install
```

---

## 3. Add brand assets (optional but recommended)

Create `brand_assets/` in the project root and drop in:

- Logos (SVG preferred, PNG fallback)
- A `DESIGN_GUIDELINES.md` with brand colors (hex), typography, voice, do/don'ts
- Reference images, photography, illustrations

Claude reads this folder before designing (see `CLAUDE.md` → "Brand Assets"). If the folder doesn't exist, Claude designs from scratch using anti-generic guardrails.

---

## 4. Initialize a new Git repo

The template ships with no `.git/` directory. Initialize fresh:

```bash
git init
git add .
git commit -m "Initial commit from website template"
```

---

## 5. Create a new GitHub repo and connect it

### Option A — using the GitHub CLI (`gh`)

If you have `gh` installed and authenticated:

```bash
gh repo create <repo-name> --private --source=. --remote=origin --push
```

Replace `<repo-name>` with the project name (e.g. `mynewsite`). Use `--public` if you want it public.

### Option B — manual

1. Go to https://github.com/new
2. Repo name: `<repo-name>`. Owner: your account or org. Visibility: your choice.
3. **Do not** add a README, `.gitignore`, or license — the template already has these.
4. Click "Create repository".
5. Copy the URL GitHub shows you (e.g. `https://github.com/<user>/<repo-name>.git`).
6. In this folder run:

```bash
git remote add origin https://github.com/<user>/<repo-name>.git
git branch -M main
git push -u origin main
```

Verify with `git remote -v` — should show `origin` pointing at the new repo.

---

## 6. Deploy to Vercel

### One-time setup (only first time on this machine)

```bash
npm install -g vercel
vercel login
```

### Per-project deploy

From the project root:

```bash
vercel
```

Vercel will ask:
- **Set up and deploy?** → yes
- **Which scope?** → your account/team
- **Link to existing project?** → no (first time)
- **Project name?** → e.g. `mynewsite`
- **Directory?** → `./` (project root)
- **Override settings?** → no

It deploys to a preview URL. To push to production:

```bash
vercel --prod
```

### Auto-deploy from GitHub (recommended)

Instead of running `vercel` manually each time:

1. Go to https://vercel.com/new
2. Click "Import" next to the GitHub repo you created in step 5.
3. Framework preset: **Other** (this is plain static HTML).
4. Build command: leave empty.
5. Output directory: leave empty (or `./`).
6. Click "Deploy".

After this, every `git push` to `main` auto-deploys to production. PRs get preview URLs.

### Custom domain

In the Vercel project → Settings → Domains → add your domain. Vercel shows the DNS records to set at your registrar.

---

## 7. Workflow when working with Claude

1. Start the dev server: `node serve.mjs` (background or separate terminal).
2. Tell Claude what to build. Provide reference images if you have them.
3. Claude edits `index.html` (and any other files), then screenshots and iterates.
4. When happy: `git add . && git commit -m "..."` and `git push`. Vercel auto-deploys.

---

## 8. Resetting to template state

If you want to scrap the current site and start over without re-cloning:

```bash
# remove site files but keep template tooling
rm -rf <your-site-files>
# restore index.html to the stub from this repo's history (or the template repo)
```

Or just clone the template again into a new folder.

---

## Checklist for every new project

- [ ] Verified `node serve.mjs` works
- [ ] Verified `node screenshot.mjs` works
- [ ] Added `brand_assets/` (or decided to design from scratch)
- [ ] `git init` + initial commit
- [ ] Created new GitHub repo and pushed
- [ ] Imported repo into Vercel
- [ ] Custom domain configured (if applicable)
