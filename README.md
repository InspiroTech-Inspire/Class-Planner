# Class Planner

A simple, no-login weekly coursework tracker. Add a class, add weeks (WK 1, WK 2, …), and log Assignments or Discussion posts. Discussion posts automatically get a Discussion Post row plus Reply 1 and Reply 2 rows. Every row has its own due date, a "Submitted On" date, a status dropdown (Not started / Started / Submitted / Completed), and a stamp checkbox to mark it done at a glance. Each week can be collapsed to keep older weeks out of the way. Each item also has a single Grade field — for a discussion post, that one grade covers the post and both replies together, since they're usually graded as a set; an assignment gets its own grade. Grades are color-coded automatically (green/amber/red) based on what you type in.

It's three plain files — `index.html`, `styles.css`, `app.js` — no build step, no server, no account. Everything you enter is saved in your browser's local storage, so it'll still be there the next time you open the page on the same device and browser.

## Put it on GitHub Pages (no command line needed)

1. Go to [github.com/new](https://github.com/new) and create a repository (call it whatever you like, e.g. `class-planner`). Keep it Public, and don't add a README from GitHub's side since you already have one.
2. Open the new repository, click **Add file → Upload files**, and drag in `index.html`, `styles.css`, and `app.js` (and this `README.md` if you want). Commit the files.
3. Go to the repo's **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**. Under **Branch**, choose `main` and folder `/ (root)`, then **Save**.
5. Wait about a minute, then refresh the Pages settings — it'll show your live URL, something like:
   `https://YOUR-USERNAME.github.io/class-planner/`

That's it — the site is live and editable any time by uploading changed files the same way.

## A couple of things worth knowing

- Data lives in your browser's local storage, scoped to that exact URL. It won't follow you to a different browser or device, and clearing your browser's site data will clear it too. If you want it backed up, there isn't a built-in export yet — let me know if you'd like one added (e.g. download/import as a file).
- Anyone with the link can view the page, but each visitor only sees and edits their own local data — nothing is shared or synced between people.
- Everything is plain HTML/CSS/JS, so it's easy to keep tweaking by hand (colors are CSS variables at the top of `styles.css`).
