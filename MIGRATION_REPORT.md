# Portfolio migration report

## 1. Migration summary

The portfolio was upgraded from **static HTML + Bootstrap + jQuery** to a **React + Vite + TypeScript + Tailwind** stack.

- **Before:** Single `index.html` with inline/script-based behavior, Bootstrap, SCSS, jQuery, Waypoints, Stellar, Firebase (form).
- **After:** React 18 SPA with Vite 5, TypeScript (strict), Tailwind 3. Content lives in `src/data/content.ts`. All sections are React components with a single entry `index.html` and `src/main.tsx`.

Existing copy (about, experience, projects, skills, contact, social links) was preserved and lightly edited for consistency. The contact form remains “under repair” with an email CTA; Firebase was not re-integrated.

---

## 2. Architecture / tree highlights

```
portfolio/
├── index.html              # Vite entry (root)
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── public/
│   ├── favicon.svg
│   ├── images/             # Put mlkp.jpg, internPic1.jpeg here
│   └── resume/             # Put Resume.pdf here
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css            # Tailwind + CSS variables, reduced-motion
    ├── vite-env.d.ts
    ├── data/
    │   └── content.ts       # Single source of truth for copy/links
    ├── context/
    │   └── ViewerContext.tsx # Parallax state (mouse/camera), provider + useViewer
    ├── utils/
    │   └── parallax.ts      # tiltTransform(), parallaxOffset()
    ├── types/
    │   └── face-detection.d.ts
    └── components/
        ├── Hero.tsx
        ├── About.tsx
        ├── Contact.tsx
        ├── Skills.tsx
        ├── Layout/
        │   ├── Nav.tsx
        │   └── Footer.tsx
        └── Resume/
            ├── ResumeSection.tsx   # Experience + Projects, 3D tilt
            └── CameraControl.tsx    # Optional camera toggle
```

- **State:** `ViewerProvider` holds normalized `(x, y)` and `source` (mouse | camera | idle). Resume and Skills consume it for 3D tilt; no global store.
- **Styling:** Tailwind + `index.css` (CSS variables, `.glass` / `.glass-strong`, reduced-motion overrides).
- **Paths:** `@/` alias points to `src/` (Vite + TS).

---

## 3. Files changed

| Category        | Files |
|----------------|-------|
| **New**         | `.gitignore`, `eslint.config.js`, `package.json`, `package-lock.json`, `postcss.config.js`, `tailwind.config.js`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `public/favicon.svg`, all under `src/` (see tree) |
| **Modified**    | `index.html` (replaced with Vite entry) |
| **Unchanged**   | Existing `css/`, `scss/`, `fonts/`, `js/` (legacy) — not used by the new app; can be removed or kept for reference. |

---

## 4. Interactive features (camera + fallback)

- **Mouse parallax:** Cursor position is normalized to `-1..1` and drives:
  - 3D tilt on the Resume block and Skills grid (`perspective` + `rotateX`/`rotateY`).
  - Smooth transition (e.g. 0.15s ease-out); no layout shift.
- **Idle animation:** When there is no mouse/camera input, a very slow sine/cosine drift updates `(x, y)` so the resume has a subtle “breathing” motion. Respects `prefers-reduced-motion`.
- **Optional webcam (privacy-first):**
  - Camera is **never** requested automatically.
  - A “Use camera” control appears above the resume; on click, the app calls `getUserMedia` and asks for permission.
  - If the user denies or the API is unavailable, the app continues with **mouse + idle** only; no error spam.
  - If permission is granted and the browser supports the **Face Detector API** (Chrome), face bounding box drives `(x, y)` for a “screen follows viewer” effect. Otherwise, camera is turned off and behavior falls back to mouse.
  - “Turn off” stops the stream and releases the camera; state returns to mouse/idle.
- **Performance:** Single `requestAnimationFrame` loop for face detection when camera is on; mouse uses one `mousemove` listener. Idle uses a 100ms `setInterval`. No heavy libraries; FPS and battery impact kept low.

---

## 5. Verification command outputs

```bash
npm install
# added 233 packages, and audited 234 packages in 11s

npm run typecheck
# (no output — success)

npm run lint
# (no output — success)

npm run build
# vite v5.4.21 building for production...
# ✓ 42 modules transformed.
# dist/index.html                   0.86 kB │ gzip:  0.49 kB
# dist/assets/index-B8942h67.css   14.60 kB │ gzip:  3.85 kB
# dist/assets/index-YLDDK4bG.js   162.87 kB │ gzip: 52.94 kB
# ✓ built in 907ms
```

---

## 6. Commit and push status

- **Commit hash:** `273cbd9`
- **Message:** `feat: migrate portfolio to React + Vite + TypeScript + Tailwind` (with bullet summary in body).
- **Push:** `git push origin master` — success (`12f05e9..273cbd9  master -> master`).

---

## 7. Blockers / notes

- **Images / PDF:** The app expects `public/images/mlkp.jpg`, `public/images/internPic1.jpeg`, and `public/resume/Resume.pdf`. If those were in the old repo under `images/` and `resume/`, copy them into `public/images/` and `public/resume/` so the new build shows the hero/about images and the CV download works.
- **Legacy assets:** Old `css/`, `scss/`, `fonts/`, `js/` (including Firebase) are unchanged and not used by the Vite app. You can delete them after confirming the new site, or keep them in a `legacy/` folder for reference.
- **Contact form:** Still noted as “under repair”; only the “Email me” CTA is active. Firebase was not re-wired in this migration.
- **Face Detector:** Only available in Chromium-based browsers; elsewhere the camera option is “permission granted, fallback to mouse” as described above.

---

**Run the app:** `npm run dev` then open the URL shown (e.g. `http://localhost:5173`).
