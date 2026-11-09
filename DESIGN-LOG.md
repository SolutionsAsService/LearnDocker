# DESIGN-LOG: Learn Docker (redo of the inherited "Docker Learning Hub")

9 Nov 2026. Mode **Adaptive** (a public reader), run type **Full** with the **Landing** rule. Brief: "next site to redo" with DADA. The inherited site was a static page set with a stock-photo hero, seven links to pages that did not exist, an unsourced news list and a sample app; it was rebuilt from scratch, keeping the repository, the MIT licence and the topic (Docker).
Panel seated by `pick_panel.py --mode adaptive --run-type full --project LearnDocker --data-graphic` (8 seats, one agent each, three at a time, each filing a verdict file, each reading its own `seats/<id>.md`): Debord, Shklovsky, Holmes, Mace, Cairo, Tufte, Krug and the rotation seat Mondrian. Tools: Playwright (headless Chromium), Node for the gate, and a **real Docker daemon** (Engine 29.9.2, Compose 5.6.1, started in the sandbox with `dockerd --iptables=false --storage-driver=vfs`).
**Stop conditions: S1 met, S2 NOT met (R2 re-judged 3 of 8 seats: Debord PASS, Krug PASS, Cairo OBJECT with one defect that was fixed afterwards and not re-judged; the other five seats were not re-seated), S3 NOT met, S4 met, S5 met.** The run closes at R2 with S2 and S3 open.

## Traversal Plan

Seed, **reconstructed after R0 from the moves actually taken, not chosen before them**: Stance `The Truthful Art (Alberto Cairo)`, Rule `Visual Hierarchy (Arnheim, Dondis)`, Breaker `Making and Breaking the Grid (Timothy Samara)`, counterpoint by dotted edge `crit_prov_debord -.->|attacks smoothness favored by| crit_use_krug`.
Chain: Cairo (a claim stands only if it was run) -> Visual Hierarchy (one figure, then the rest) -> Samara (break the card grid and the hero photo: the landing is the build as layers), counterpointed by Debord vs Krug.

### Frontier (after R0)
| Candidate | Reached via | From anchor | Status |
|---|---|---|---|
| F-a Lessons that run: every command executed against a real daemon, output stored | Cairo R0 | Cairo seat | TAKEN (M1) |
| F-b Remove what cannot be defended: news list, "interactive labs", stock images, the node+mysql sample | Debord R0 | Debord seat | TAKEN (M2) |
| F-c Landing = one figure, the build as layers, from measured builds | Breaker | Samara | TAKEN (M3) |
| F-d Say what was not run: one-machine swarm, Linux only, shells, Docker Desktop | Debord R1, Mace R1 | seats | TAKEN (M4) |
| F-e A gate that fails: dead links, banned phrases, wrong output, a measurement that stops supporting the lesson | Cairo R0 | Cairo seat | TAKEN (M5) |
| F-f Dockerfile beside the stack on a phone (Shklovsky R1 F5, Mondrian R1 F5) | Shklovsky, Mondrian | seats | DEFERRED (the stack ends at 782 on a 812 px screen; putting the Dockerfile above it would push it off) |
| F-g Make the cached-versus-rerun fact the form, cached layers dropping out of view (Shklovsky R1 F1, F3) | Shklovsky | seat | DEFERRED (the all-builds grid, added for Tufte, makes the contrast at a glance; the animation is a further move) |
| F-h Failure moments break the page template (Shklovsky R1 F4) | Shklovsky | seat | DEFERRED |
| F-i Defer `data/lessons.json` on the landing (Holmes R1 F8) | Holmes | seat | DEFERRED (12.8 KB; page is 46 KB total) |
| F-j Measure the node:22 base image's size and layer count | Cairo R2 N1 | Cairo seat | DEFERRED (the row says "size not measured") |
| F-k Time rather than bytes as the bar length (Tufte R1 F1) | Tufte | seat | DEFERRED (the grid carries time; bars stay bytes, disclosed) |

## R0 premortem (measured)

Run on the inherited site (served locally) and its commands (run against Docker): seven links from the home page to files that do not exist; a news list with no source or date; "interactive labs" that do not exist; the Dockerfile lesson built an image whose container exits at once with "Cannot find module server.js" because the app it names is never provided; the Compose lesson uses `docker-compose` (hyphen), which is "command not found" on a current install, and a `version:` key that Compose 5 reports as obsolete; the sample app's `depends_on` comment claims a wait that the setting does not perform; mysql:5.7 and node:14, both long out of support; no Docker version, date or owner anywhere.
Build environment: containers on the check machine can pull images but cannot reach the npm registry (`EAI_AGAIN`), so a lesson that runs `npm install` cannot be checked. The lab app was made dependency-free for that reason and the page says so.

## Decision Records

## Move M1: Lessons that run (KEEP-THE-RULE)
Depends on: none. Anchors: Stance The Truthful Art. Intent: `data/lessons.json` holds every command the site shows; `scripts/check.mjs` runs each in a fresh folder against the daemon and fails unless it exits 0 and prints what its `expect` says; `--update` writes the real output back as the transcript. 34 commands in 6 lessons (first containers, build, Compose, networks, volumes, swarm). Alternatives rejected: keep typed-in transcripts (the inherited site's failure), or run nothing and mark the output "example". Consequence: some output is filtered (`show`) or truncated (`tail`) and the page says when; the printed `out` must still satisfy `expect` (a static check, added in R1).

## Move M2: Delete what cannot be defended (KEEP-THE-RULE)
Depends on: M1. Intent: remove the news list, the "interactive labs" promise, the stock PNGs, the `dockerized-node-mysql-app/` folder (superseded by `lab/hello-node`) and the old stylesheet; the three orphaned pages redirect to live ones. Consequence: fewer words and no photographs; a claim lint refuses the phrases that returned in R0 ("interactive labs", "docker-compose up", and others).

## Move M3: The landing is the build as layers (BREAK)
Depends on: M1. Anchors: Breaker Making and Breaking the Grid (Timothy Samara) | Rule Visual Hierarchy | Counterpoint Debord vs Krug. Intent: the real Dockerfile of the lab app beside the layers of the image it makes (sizes from `docker history`); five tabs (empty cache, change nothing, edit server.js, edit package.json, change the base image) mark each step "reused from cache" or "ran again" with the time, from real `docker build` runs (`data/measured.json`); a button adds the container's writable layer. Alternatives rejected: a hero illustration (the inherited habit), a card grid of topics. Consequence: bytes are not the question (the base image dwarfs everything), so R1 added a grid of all five builds and the times. Frontier effect: opens F-f, F-g, F-k.

## Move M4: Say what was not run (KEEP-THE-RULE)
Depends on: M1, M3. Intent: the About page lists versions, method and gaps (one-machine swarm only, Linux/amd64 only, no Docker Desktop, no Windows, no multi-machine swarm); statements the pages could not show are worded as unrun ("we did not run that form here"); the Concepts page names the shell the commands assume and the install guide; terms are defined where first used.

## Move M5: A gate that fails (KEEP-THE-RULE)
Depends on: M1. Intent: `node scripts/check.mjs` (full, needs Docker), `--static` (links, external requests, banned phrases, `data-fig` keys, printed output against `expect`), `--update`, `--measure`. The measurement asserts the lesson's claim: editing `server.js` leaves `RUN npm install` cached and reruns `COPY . .`; editing `package.json` reruns the install. Measured fixtures: a changed `expect` makes `--static` exit 1; a changed measurement makes the claim check fail.

## Panel Reports

### Panel, WHOLE, round R0  (artifact examined: the inherited site and its commands, run)
| Critic | Anchor used | Observed in the work | Verdict PASS/OBJECT | Requested change |
|---|---|---|---|---|
| Critic: Evidence (Cairo) | How Charts Lie | the build lesson's container exits at once; `docker-compose` not found; `version:` obsolete; mysql:5.7 and node:14 | OBJECT | run every lesson, stamp versions |
| Critic: Usability (Krug) | Don't Make Me Think | 7 dead links on the home page; no first action; orphan pages | OBJECT | one trunk, working links, a first container |
| Critic: Provocateur (Debord) | The Society of the Spectacle | unsourced news, "interactive labs", a `depends_on` comment that is false | OBJECT | delete what cannot be shown |

### Panel, WHOLE, round R1  (artifact examined: http://localhost:8127 after M1-M5)
| Critic | Anchor used | Observed in the work | Verdict PASS/OBJECT | Requested change |
|---|---|---|---|---|
| Critic: Provocateur (Debord) | The Society of the Spectacle | compose note contradicts its transcript; "never went down", two "common cause" sentences, a container definition and "reuses every layer" said more than a run showed | OBJECT | fix the note; delete or run each claim |
| Critic: Evidence (Cairo) | How Charts Lie | all five cache scenarios and three lessons reproduce; base "9 layers" miscounted (4 add data); time sum included FROM; "to scale" false at the 0.5% floor; transcript order and a /tmp path; static gate did not compare `out` with `expect` | OBJECT | fix the counts, the sentence and the gate |
| Critic: Usability (Krug) | Don't Make Me Think | first button was "Build one yourself"; tab row clipped at 375; "three files" but four | OBJECT | first action = run a container; wrap tabs; say four files |
| Critic: Provocateur (Shklovsky) | Art as Technique | the layer diagram is familiar; the caption does the seeing; inner pages repeat one template; Dockerfile falls below the stack on a phone | OBJECT | make the cache fact the form; break the template at failures |
| Critic: Inclusion (Holmes) | Mismatch | readout re-read in full on each tab; button name flips while aria-pressed; 20+ identical "Copy to clipboard" names; a scrolling table with no focus stop; 10 px text | OBJECT | announce the changed sentence, fixed button label, name each copy button, focusable table, 12 px |
| Critic: Inclusion (Mace) | Principles of Universal Design | commands assume bash; no install path; undefined jargon; no plain sentence on what Docker is | OBJECT | shell note, install link, definitions, one plain sentence |
| Critic: Evidence (Tufte) | The Visual Display of Quantitative Information | bars encode bytes, the claim is "what reran"; the 0.5% floor overstates small layers; five tabs force the reader to hold four states | OBJECT | small multiples, label floored bars |
| Critic: Non-objector (Mondrian) | Plastic Art and Pure Plastic Art | inner code blocks and Copy are rounded, the landing is square; dark mode lifts orange and blue to pastel; duplicate sentences | OBJECT | radius 0; hold dark hues; drop a duplicate |

### Panel, WHOLE, round R2  (artifact examined: http://localhost:8127 after the R1 resolutions; three seats re-judged)
| Critic | Anchor used | Observed in the work | Verdict PASS/OBJECT | Requested change |
|---|---|---|---|---|
| Critic: Provocateur (Debord) | The Society of the Spectacle | F1-F6 fixed; new callout wording asserted what was not run | PASS | soften to "may" (done) |
| Critic: Usability (Krug) | Don't Make Me Think | tabs, four files, first action text fixed; first action below the grid | PASS | move the first action up (done) |
| Critic: Evidence (Cairo) | How Charts Lie | F3, F4, F5, F7, F9, F11 fixed by measurement; 20 grid cells and 5 times match the data; "Change the base image" row showed node:24's size for node:22 | OBJECT | show "not measured" (done); "after FROM" in one explanation (done) |

Verdict files from R0 (3 of 3), R1 (8 of 8) and R2 (3 of 3) landed in the panel directories. Five seats (Shklovsky, Holmes, Mace, Tufte, Mondrian) were not re-seated in R2; Cairo's N1 fix was measured by the conductor, not re-judged.

## Resolutions

| Seat(s): finding | Outcome |
|---|---|
| Cairo + Krug + Debord R0: the inherited lessons fail when run, dead links, unsourced content | ADAPT (M1, M2): rebuilt, every command run, redirects, deletions |
| Debord R1: compose note says "exited", the transcript says "Up" | ADAPT: the note says it depends on timing |
| Debord R1: "never went down" (swarm), "keeps answering" (lesson note) | ADAPT: reworded; "requests were not sent during the update" |
| Debord R1: two "common cause" sentences | ADAPT: one deleted, one reworded to "one cause" |
| Debord R1: a container "is a running process with its own view..." | ADAPT: "what Docker starts from an image: a process with its own writable layer on top" |
| Debord R1: "reuses every layer it can" | ADAPT: "reuses the steps whose inputs did not change" |
| Cairo R1: base row "9 layers" | ADAPT: counts layers that add data (4) |
| Cairo R1: "N of 4 steps after FROM, 3.6 s" included FROM's time | ADAPT: the sum excludes FROM (3.5 s) |
| Cairo R1: "bars to scale" false at the minimum width | ADAPT: "proportional to bytes, with a minimum width" |
| Cairo R1: static gate did not compare printed output with `expect` | ADAPT (M5): static check added; a tampered `expect` exits 1 |
| Cairo R1: transcript order and a /tmp path in a transcript | DEFERRED (stored output is the run's own; the order follows the shell's capture order) |
| Cairo R1: first build pulls 50+ MB, the tab assumes a warm base | ADAPT partly: the base row says "a first pull downloads it"; sizes and times still assume a warm cache (PARTLY in R2) |
| Cairo R1: two unmeasured sentences | ADAPT: reworded to say they were not run |
| Cairo R1 + Holmes R1: targets under 44 px, 10 px text | ADAPT: tabs 44 px, layer text 12 px; the 20 px links on Commands DEFERRED |
| Cairo R2: node:22 row showed node:24's size and layers | ADAPT: "size not measured", no layer count, no bar |
| Krug R1: first action muddled | ADAPT: "New to Docker? Run your first container" under the lede, at the first screen |
| Krug R1: tab row clipped at 375 | ADAPT: tabs wrap |
| Krug R1: "three files", four shipped | ADAPT: "four files", `.dockerignore` explained |
| Krug R1: nothing says what Docker is | ADAPT: the lede opens with one plain sentence |
| Shklovsky R1: familiar diagram; the caption does the seeing | DEFERRED (F-g) |
| Shklovsky R1: inner pages repeat one template | DEFERRED (F-h) |
| Shklovsky R1 + Mondrian R1: Dockerfile falls below the stack on a phone | DEFERRED (F-f) |
| Holmes R1: readout and button announcements, copy names, table focus | ADAPT: a separate short live region; a fixed button label; copy buttons named by the command; focusable table region |
| Holmes R1: load `lessons.json` only where used | DEFERRED (F-i) |
| Mace R1: bash-only commands, no install path | ADAPT: "Which shell" callout (WSL or Git Bash; untested), install link, failure branch |
| Mace R1: Docker Desktop differences unnamed | ADAPT: the About page names the mechanism and says it was not tested |
| Mace R1: undefined jargon | ADAPT: Swarm words paragraph; layers defined in the lede |
| Tufte R1: bars show bytes, not what reran; tabs hide the comparison | ADAPT partly: the all-builds grid (5 x 4 cells, time column) under the readout; the bars stay bytes and are disclosed (F-k) |
| Mondrian R1: rounded code blocks | ADAPT: radius 0 |
| Mondrian R1: dark mode orange and blue too light | ADAPT: dark hues darkened (reuse #4f8fb3, ran #e0662f) |
| Mondrian R1: duplicate sentence beside the figure | DEFERRED (advisory) |
| Debord R2: Windows shell claims asserted | ADAPT: "may" |

## Anchor Ledger
| Anchor | Role | Status KEEP / ADAPT / SCRAP | Evidence | Replacement or note |
|---|---|---|---|---|
| The Truthful Art (Alberto Cairo) | Stance | KEEP | every command is run; the gate fails on a wrong expectation | none |
| Visual Hierarchy (Arnheim, Dondis) | Rule | KEEP | one figure, then chapters | none |
| Making and Breaking the Grid (Timothy Samara) | Breaker | ADAPT | the figure survived Shklovsky's "familiar diagram"; Tufte's objection led to a grid next to it | the grid, deferred animation |
| crit_prov_debord -.-> crit_use_krug | Counterpoint | KEEP | Debord stripped claims, Krug demanded a first action on the first screen; both PASS in R2 | none |

## Deletion review and residual diff (Step 2f)
Pre-existing elements and what they earned: the stock hero and logo PNGs (removed: no information, no source); the news list (removed: no sources); "interactive labs" (removed: did not exist); `dockerized-node-mysql-app/` (removed: its `depends_on` comment was false, its images were end-of-life, its `npm install` is not runnable on the check machine; replaced by `lab/hello-node`); `style.css` (replaced by `assets/site.css`); `introduction.html`, `components.html`, `tutorials.html` (kept as redirects so old links resolve); `LICENSE` (kept). Retained-value ledger: the repository, licence and topic only; no content survived.

## Step 2g: figures re-measured at the final state
| Printed figure | Procedure | Final value | Result |
|---|---|---|---|
| "34 commands, all run" | count of steps in data/lessons.json; full gate run | 34, gate OK against Docker 29.9.2 | reproducible |
| image "173 MB" | `docker image inspect` in the measure step | 173393859 B | reproducible |
| base "172 MB, 4 layers that add data" | `docker history` rows with bytes > 0 before WORKDIR | 8426563 + 158211916 + 5366589 + 388 B | reproducible (Cairo recomputed) |
| five cache scenarios and their times | real builds in a temp copy | 3.5, 0.0, 0.2, 3.1, 3.6 s; the grid's 20 cells match | reproducible (Cairo rebuilt all five by hand) |
| container writable layer "0B (virtual 173MB)" | `docker ps -s` | match | reproducible |
| networks and volumes lessons | Cairo ran them by hand with her own names | match | reproducible |
| landing figure bottom edge | getBoundingClientRect | 576 at 1280x800, 782 at 375x812 | reproducible |
| no horizontal overflow, 0 console errors | scrollWidth and console at 1280, 375, 320 over 9 pages | 0 pages, 0 errors | reproducible |
| 11 pages, 6 lessons | `node scripts/check.mjs` | OK | reproducible |

## Stop test
- **S1** Frontier: no OPEN items; F-f to F-k are DEFERRED with reasons. Met.
- **S2** R2 re-judged 3 of 8 seats: Debord PASS, Krug PASS, Cairo OBJECT (one defect, fixed and measured by the conductor afterwards, not re-judged). Shklovsky, Holmes, Mace, Tufte and Mondrian were not re-seated. NOT met.
- **S3** Two consecutive quiet WHOLE rounds: NOT met. R1 and R2 each produced ADAPT items.
- **S4** Ambition push: the figure was pushed from a diagram with a legend to a figure of measured builds with times, plus a grid of all five builds. Measured delta: scenarios visible at once 1 -> 5; printed layer count corrected 9 -> 4; unmeasured figures shown 1 -> 0 ("size not measured"). Met.
- **S5** Dotted edges: Debord vs Krug applied (both sat in R0, R1 and R2; both PASS in R2). Met.

## Double loop
The panel and the data audit before it found what the author could not: a lesson whose container exits, a command that does not exist on a current install, a sentence in a comment that was false, and in this run's own text a layer count that was wrong, a total that included the wrong step, a "to scale" claim the code contradicted, and the base image's numbers shown for a base image that was never measured. The process failed in two places: a gate that did not compare what the page prints with what the command is expected to print (found by Cairo's fixture, fixed), and R2 that did not re-seat five of eight seats, which leaves S2 open. Several shell commands were refused by the safety check (a heredoc with the double-dollar sequence, Python string replacement that did not apply); the Edit tool was used instead and each edit was verified on the rendered page. Graph amendment: none to the graph; to the workflow: re-seat every objecting seat in R2, and measure the first-screen edge after every change that adds a line.

## Carry-Forward Ledger
- Run every command a lesson shows; a transcript typed by hand will drift. Keep a gate that compares what the page prints with what the command is expected to print, and test the gate with a tampered fixture.
- A sandbox can run a real Docker daemon: `dockerd --iptables=false --storage-driver=vfs`; image pulls and published ports work, build-time network access (npm) does not, so write the lab app without dependencies and say so.
- Measure a build cache honestly: empty the cache first, count a FROM step that finishes at once as reused, sort parallel BuildKit steps by step number, and assert the lesson's claim in the gate.
- A figure that shows one measurement under another condition (node:22 under node:24's sizes) is a lie by omission; show "not measured".
- A total must match its label: "after FROM" excludes FROM's time.
- Bars drawn with a minimum width need a sentence that says so.
- Name interactive controls by what they act on (copy buttons by the command), and announce one sentence, not the whole readout.
- Put the first action on the first screen at the phone size, not only at desktop width.

## Compliance Check
- [x] Tooling inventory done: Playwright, Node, a real Docker daemon
- [x] Mode stated with the reason (Adaptive: public reader)
- [x] Panel seated from `pick_panel.py`, every seat briefed from its `seats/` file
- [ ] Seed with exact labels chosen before the first move: reconstructed afterwards (stated in the plan)
- [x] Run type stated (Full + Landing), no freeze broken (nothing was frozen; the repository was rebuilt)
- [x] Landing leads with one bold graphic, complete in the first viewport at 1280x800 (bottom 576) and 375x812 (bottom 782)
- [x] BREAK move taken (M3)
- [x] Decision Record per move (M1-M5)
- [x] Panel Report per round, every critic citing something observed
- [x] Every OBJECT resolved ADAPT, OVERRULE or DEFERRED
- [ ] WHOLE rounds with S3 met: R0, R1, R2 run; S3 not met
- [ ] R2 re-seated every objecting seat: 3 of 8 re-seated
- [x] Every printed figure re-measured at the final state (Step 2g)
- [x] Anchor Ledger complete
- [x] Double-loop paragraph written
- [ ] Run recorded in the ledger: done afterwards from this file, ungraded
- [x] Final reply states mode, tools, stop conditions and what was skipped
