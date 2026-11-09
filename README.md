# Learn Docker

An unofficial hands-on guide to Docker, not affiliated with Docker, Inc. Every command on the site is run by a script against a real Docker daemon, and the output printed under each one is the output of that run.

The home page draws the layers of an image built from the lab app in `lab/hello-node`, and shows from real builds which build steps Docker reuses and which it runs again when you change a file. The chapters cover concepts, building an image, Compose, networks and volumes, and Swarm, plus a page listing every command with its output.

## Run the site

```bash
npx serve .      # or: python3 -m http.server
```

Open the printed URL. Opening `index.html` directly will not work, because the data is loaded with `fetch`.

## Check it

```bash
node scripts/check.mjs            # runs every lesson against your Docker daemon, plus link and claim checks
node scripts/check.mjs --static   # only the link and claim checks, no Docker needed
node scripts/check.mjs --update   # also rewrites the printed output, data/verified.json and data/measured.json from the run
```

The check needs Docker running, `bash`, and network access to pull the small public images the lessons use (`hello-world`, `nginx`, `alpine`, `node`). It creates containers, networks, volumes and a one-node swarm with generic names (`web`, `server`, `lab-net`, `notes`), so run it on a machine where those names are free. It removes what it creates.

`data/lessons.json` holds every command and what it must print (`expect`). `data/measured.json` holds the layer sizes and the build-cache measurements; the gate fails if they stop supporting what the lessons say.

Design decisions and review rounds are in [DESIGN-LOG.md](DESIGN-LOG.md).
