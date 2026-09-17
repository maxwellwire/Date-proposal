# date-proposal

A tiny site: she gets asked, picks yes, chooses a date and time, and it gets
saved to a database only you can see at `/admin`.

## What's in here

- `server.js` — the backend (Node + Express). Saves every response to
  `responses.json` (a simple file-based database — no external service to
  set up).
- `public/index.html` — the page she actually sees.
- `/admin` — password-protected page showing everything she's picked.

## Run it on your own computer first

1. Install [Node.js](https://nodejs.org) if you don't have it (v18+).
2. In this folder, run:
   ```
   npm install
   npm start
   ```
3. Open **http://localhost:3000** — that's her page.
4. Open **http://localhost:3000/admin** — that's your dashboard. It'll ask
   for a username (leave blank) and password. The default password is
   `changeme` — change it (see below) before you send this to anyone.

## Set your own admin password

Set an environment variable called `ADMIN_PASSWORD` before starting the
server:

```
ADMIN_PASSWORD=whateveryouwant npm start
```

On a host (see below) you set this in their "Environment Variables" settings
instead of on the command line.

## Hosting it for real (so she can open a link)

Easiest free options, in order of how simple they are:

### Render.com
1. Push this folder to a GitHub repo.
2. On [render.com](https://render.com), click **New → Web Service**, connect
   the repo.
3. Build command: `npm install` — Start command: `npm start`.
4. Add an environment variable `ADMIN_PASSWORD` with your own password.
5. Under the service's **Disks** tab, add a small persistent disk mounted at
   `/opt/render/project/src` (or wherever the repo lives) — otherwise
   `responses.json` gets wiped every time the service restarts.
6. Deploy. You'll get a URL like `https://your-app.onrender.com` — that's the
   link you send her. Your dashboard is `https://your-app.onrender.com/admin`.

### Railway.app
1. Push this folder to a GitHub repo.
2. On [railway.app](https://railway.app), **New Project → Deploy from GitHub
   repo**.
3. Add the `ADMIN_PASSWORD` variable in the **Variables** tab.
4. Railway gives each service a small persistent volume automatically — mount
   one at `/app` if you want `responses.json` to survive redeploys, or leave
   it and just remember it resets on redeploy.
5. Generate a public domain under **Settings → Networking**.

### A VPS you already control
Copy the folder over, run `npm install`, then keep it running with something
like `pm2 start server.js` or a systemd service, and put it behind your
existing web server / domain.

## Notes

- `responses.json` is created automatically the first time someone submits.
- Every "no" click also gets logged (with a dodge count), so you'll see how
  much convincing it took.
- This is intentionally simple — one file as the database, one password for
  admin. If you ever want real user accounts, multiple admins, or a proper
  database (Postgres etc.), that's a bigger step up from this.
