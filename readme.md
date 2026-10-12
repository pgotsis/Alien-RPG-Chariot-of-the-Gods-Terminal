# What it is

An interactive ship-computer terminal for the **ALIEN Roleplaying Game**, built around **Chariot of the Gods**. Players use crew access cards or PINs to explore ship records, mail, personnel, systems and deck blueprints. The GM manages each group's ships and story changes from a separate desk. The interface keeps the green-screen MU/TH/UR presentation and works on phones, tablets and desktop computers.

Original sources:

- [DapperDaveW's original terminal on Experimental Gamer](https://www.experimentalgamer.com/AlienRPG/ChariotOfTheGods/Terminal/)
- [MaciejLisCK's upstream repository](https://github.com/MaciejLisCK/Alien-RPG-Chariot-of-the-Gods-Terminal)

## Implemented in this fork compared with upstream main

The comparison below uses upstream [`main` at `fff6cf5`](https://github.com/MaciejLisCK/Alien-RPG-Chariot-of-the-Gods-Terminal/commit/fff6cf5bd2f72cb3aba9bd5ceb5f489665c55ce7). Upstream provides a static HTML/JavaScript terminal with crew mail, access codes, interactive maps and supporting assets. This fork retains and reorganizes that material while adding the following application features and development workflow.

### Application and presentation

- Rebuilt the terminal as a Vue application with separate views and reusable components, bundled with Vite.
- Added responsive layouts for phones, tablets and desktops, including the personnel rolodex and centered numeric keypad with equal-height login panels.
- Replaced the fixed ship branding with the selected ship's name and computer designation: MU/TH/UR 2000 on Cronus and MU/TH/UR 6500 on Montero.
- Added crew portraits and an initials fallback for accounts without a usable image.
- Added a standby screen when no table code is supplied, a public terminal view, and clearance-aware navigation between application sections.

### Persistent tables and multiple ships

- Added a Node.js 24/Fastify backend and SQLite storage for each table's live state.
- Added six-character table codes and player links that select a specific group's copy of the scenario.
- Added scenario templates for Cronus, Montero and Astraeus, plus a Chariot of the Gods preset containing Montero and Cronus. Each ship has its own computer, roster and records.
- Added a configurable home ship, ship membership and individual player-access controls. Other ships can remain closed until the GM opens them.
- Added player switching between open facility computers and GM-only crew registration at other facilities. Personal mail and notes are stored once per table and available wherever the person is registered; facility systems, broadcasts, logs, blueprints and ship files remain local. Existing personal records are migrated to shared storage.
- Added automatic polling, approximately every five seconds, to distribute changes and notify stations of updated sections. Table state survives server restarts; station login and viewed-item state remain in the browser.

### Personnel, access cards and mail

- Added PINs for all 18 listed Cronus crew and all five Montero crew, including people without existing mail or other personal content.
- Set Montero's default roster status to Aboard and its titles to Captain, Pilot, Technician, Cargo Handler and Corporate Liaison.
- Added salted SHA-256 PIN hashes and separate GM PIN-reference files. Table-specific overrides replace previous codes without rewriting defaults. New overrides are also encrypted so the authenticated GM can display them and generate crew credentials; player responses exclude recoverable PINs.
- Added editable crew names, titles, statuses and clearances, status dropdowns, and creation of additional crew members with PINs and a choice of unused portraits.
- Added live roster and PIN updates on the login screen. Personnel status is omitted from the login rolodex while remaining available in the personnel views according to clearance.
- Added data-driven clearance inheritance, module grants, restricted visitor accounts, clearance-specific descriptions and classified roster details.
- Limited mailbox selection to the signed-in user's own account, preserving permitted crew broadcasts. Added message composition and persistent personal station notes.

### GM desk and adventure editing

- Added a GM-token-protected desk, table list, create-table configuration view, table deletion from the list, and a separate table-editing view.
- Added a vertical section sidebar and ship-name selectors for the table editor.
- Added table comments, an editable campaign clock, facility/access management, crew and PIN editing, and GM-only crew registration controls. Facilities support Ship, Base, Space Station and Offices types, with editable names, AI names and versions.
- Added system creation, editing and removal, with compact fields for state, visibility and severity. Suggested names populate scenario-specific or common ship-system presets, including state choices and adventure descriptions.
- Added editors for every existing scenario log, announcement and mail entry, alongside new entries. Dates, text and visibility can be changed, and entries can be removed.
- Separated public announcements from mail. Public/crew broadcasts and announcement clearance determine which transmissions appear in the terminal's corresponding views.
- Added prepared events containing announcements, mail, dated log entries, system changes and roster changes. Events can be saved and edited before play, previewed and pushed in one action; all changes apply in a single transaction, with the last-pushed time recorded.

### Blueprints, navigation and scenario records

- Added table-specific blueprint editing: overview and deck image layers by clearance, deck names and dimensions, room hotspots, room descriptions and access requirements.
- Added selection of bundled blueprint images or HTTPS image URLs while retaining the original interactive deck-map material.
- Added a command/company Star map with a location dropdown, scenario defaults, editable waypoints, dates, navigation notes and background images. It uses a schematic coordinate grid; coordinates and presets are story aids rather than astronomical measurements. Existing visitor restrictions still apply.
- Organized scenario content into ship templates, clearance-aware files, logs, notes and tasks. Retained legacy Astraeus media and puzzle scripts as scenario material; the current terminal lists tasks but does not execute those legacy procedures.

### Running, deployment and validation

- Added locked npm dependency installation, a production frontend build, and a Vite development server with an API proxy.
- Added environment-based configuration for port, data directory, GM authentication and URL prefix; health checks; structured logs; graceful shutdown; and support for deployment behind an HTTPS reverse proxy under a path prefix.
- Kept runtime database files, GM PIN-reference files and archived scenario scripts outside the served frontend.
- Added automated GM tests covering scenario defaults, PINs and clearances, table isolation, persistence, new crew and portraits, personal-data transfer, document editing, blueprints, navigation and atomic prepared events.

# Run

Node.js 24 is required (`engines` in `package.json`).

```
npm ci
npm run build
```

The interface is a Vue app in `client/`. Pictures and sounds the browser loads are in `client/public`, and `npm run build` copies them into `dist/` with the app. Production is one process, configured only by the environment:

```
node server.js
```

It listens on `127.0.0.1` and the port in `PORT`. Logs go to stdout. `SIGTERM` closes the server and the process exits.

`BASE_PATH` is the public URL prefix. It must start and end with `/`, for example `/apps/this-tool/`. Leave it unset, empty, or `/` only when running locally at the site root.

`DATA_DIR` is required. Live state is one SQLite file, `$DATA_DIR/app.sqlite`, outside the web root. `dist/` is the terminal the browser loads. `data/<ship>/ship.json` is a scenario template. Starting a table copies that template into the database under a 6-character code. Mail, logs, notes, roster status, systems, and announcements for that table then come from the database. Old pages and puzzle scripts for a ship stay under that ship's folder and are not served. The plaintext pin list is `gm/<ship>/pins.json` and is not served.

A task is a piece of work on that ship. A puzzle is a task with `"kind": "puzzle"`. The terminal lists tasks the clearance can see. It does not run a procedure: until a task names one, the station says none is installed. Cronus has no tasks. Astraeus tasks are filed under `data/astraeus/tasks/`. The GM starts an Astraeus table from `?gm`.

With no `?table=` code, the terminal stands by and offers no ship. The GM opens `?gm`, enters `GM_TOKEN`, and starts a table. Players use the URL that desk shows, `?table=` plus the code. Set `GM_TOKEN` before starting tables:

```
curl -sS -X POST -H "Authorization: Bearer $GM_TOKEN" -H "Content-Type: application/json" \
  -d "{\"shipId\":\"cronus\"}" \
  http://127.0.0.1:3000/api/gm/tables
```

Push a roster change to that table with the code from the response:

```
curl -sS -X PATCH -H "Authorization: Bearer $GM_TOKEN" -H "Content-Type: application/json" \
  -d "{\"roster\":{\"c-reynolds\":{\"status\":\"Deceased\"}}}" \
  http://127.0.0.1:3000/api/gm/tables/CODE
```

With a prefix, that path is under the prefix too. Terminals pick up the change within about 5 seconds. Login and which files this station has opened stay in the browser. Station notes are stored on the table.

Local root:

```
PORT=3000 DATA_DIR=./var node server.js
```

Local prefix, which is the shape to test before deploying:

```
PORT=3000 DATA_DIR=./var BASE_PATH=/apps/this-tool/ node server.js
```

Open `http://127.0.0.1:3000/` or `http://127.0.0.1:3000/apps/this-tool/`. While changing the interface, keep that server running and use `npm run dev` in another terminal. Vite reloads the Vue app and proxies `/api` to `PORT` (3000 if unset). On PowerShell, set the variables first (`$env:PORT = "3000"`). A `.env` file is for that local run only (`node --env-file=.env server.js`). Copy `.env.example`. The file is gitignored and is not read by `node server.js`.

Health is `${BASE_PATH}health` and returns 200 without opening the database. With the prefix above, that is `/apps/this-tool/health`.

nginx terminates TLS and forwards the original path, including the prefix. The app trusts `X-Forwarded-Proto`, `X-Forwarded-Host`, and `X-Forwarded-For` from that local proxy. A request to the prefix without the trailing slash redirects to the slashed path on the public https host, and the query string is kept. Card and QR links use that public prefix plus `?code=`.

```
location /apps/this-tool/ {
  proxy_pass http://127.0.0.1:<port>;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-Host $host;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

`proxy_pass` has no trailing slash, so the prefix is still on the path when it reaches the app. The plaintext pin list in `gm/` is not served.

# GM table editor

The GM desk has a table list and a separate editor with a section sidebar. Select ships by name. Roster changes (name, title, status, clearance and PIN), new crew and portraits are saved on that table. PIN overrides replace the previous access code. Login checks use salted hashes; new overrides are additionally stored with AES-256-GCM encryption for GM-only retrieval. Default PINs come from the GM reference files. The original Cronus PINs from the upstream README are preserved in `gm/cronus/pins.json` and displayed by the GM roster when they match the account hash. Only a later custom PIN that was stored solely as a hash, differs from the known defaults, and was not recorded elsewhere requires a replacement. Defaults for printing cards are in `gm/<ship>/pins.json`; table-specific overrides do not rewrite those template files. Players receive roster, blueprint and navigation changes on the next refresh, including while on the login screen.

Systems offer adventure presets, editable state choices, severity, visibility and clearance-specific descriptions. Logs, announcements and mail include the original scenario entries and can be edited, added or removed with an adventure date. Announcements and mail are separate: public announcements require `public` visibility; crew/public mail recipients are broadcasts.

Blueprints allow image layers per clearance, deck dimensions, room hotspots and room descriptions. Choose an existing image or an HTTPS image URL. The command/company Star map is a schematic navigation grid with editable ship position and waypoints, not an astronomical chart. Location presets include the adventure systems and destinations, with sensible scenario defaults. The GM can set a background using an HTTPS image URL or upload a PNG, JPEG or WebP image up to 2 MB, then adjust its fit and opacity. Background and deck-plan uploads are decoded and re-encoded to WebP on the server, stripping metadata. Uploads are limited to 2 MB, 16 million pixels and dimensions up to 8192 pixels; SVG, animated and executable formats are rejected. Stored images use opaque names outside the web root and a dedicated image-only route with security headers. Uploads require GM authentication and are rate/concurrency limited. HTTPS image URLs are loaded by the browser; the server does not fetch them.

Prepared events save transmissions, dated log entries, system changes and roster changes ahead of play. Saving does not send anything. **Push event** applies all changes in one transaction; a rejected change leaves the event unapplied. Events remain available for editing and reuse, and show when they were last pushed. Pushing a transmission again creates another entry.

The table settings clock starts at the current date, advances in real time and can be set manually or jumped forward by 5/30 minutes or 1/2/3/5 hours. Campaign times use UTC. Changing the clock updates terminal banners without changing existing record dates.

The GM roster displays known PINs and provides crew-login QR codes and printable white personnel badges, with portrait, name, title, clearance and a striped PIN. Campaign QR codes are also available in the table list and settings. Crew links contain the PIN and grant that person's access to whoever holds the code; the printed pattern is visual obscurity, not encryption. QR generation runs locally without a third-party service.

**Company override** is separate from registration. Each company-level account receives an eight-digit override code, with a GM-editable target AI at another facility on the same table. The GM can see and replace the code in the roster. A company override exposes facility systems, logs, blueprints and navigation at company clearance, plus explicitly public mail, notes and files. It does not register the person, merge their personal records into the remote AI, or expose private personal data. Override codes are encrypted for GM retrieval; changing the code, target or clearance revokes the prior remote session. A table with only one facility has no remote target until another facility is added.

**Crew registration** is GM-only. Registering someone at another facility grants access to that AI terminal while retaining the original registration. Mail and personal notes share one table-wide record and synchronize across registered facilities; there is no player move/copy action. Existing duplicate historical copies with different content are preserved during migration. Ship files remain local because the current file model represents facility records, not personal attachments.

All table edits and prepared events persist in `DATA_DIR/app.sqlite`. Back up the entire data directory, including `gm-pin.key` and `uploads/`, along with the database; losing the encryption key prevents recovery of saved override PINs. New tables use the current scenario defaults; existing table statuses are preserved. Run `npm test` for the GM persistence and editing checks.

# Languages

The upstream project maintains [English on main](https://github.com/MaciejLisCK/Alien-RPG-Chariot-of-the-Gods-Terminal/tree/main), [Polish](https://github.com/MaciejLisCK/Alien-RPG-Chariot-of-the-Gods-Terminal/tree/feature/polish-language) and [German](https://github.com/MaciejLisCK/Alien-RPG-Chariot-of-the-Gods-Terminal/tree/feature/german-language) branches. These are references to upstream translations; the rewritten application in this fork is currently in English.

# History and credits

## DapperDaveW's original game aid

The project began with **[DapperDaveW](https://www.reddit.com/user/DapperDaveW/)** and the [Cronus crew email supplement](https://www.reddit.com/r/alienrpg/comments/se3w5x/spoiler_chariot_of_the_gods_crew_emails_supplement/) written for Chariot of the Gods. Those fictional emails expanded the crew's relationships and events aboard the Cronus, giving players additional information to discover during the adventure.

DapperDaveW then created an online access-card and email interface using JavaScript and CSS, hosted on [Experimental Gamer](https://www.experimentalgamer.com/AlienRPG/ChariotOfTheGods/Terminal/). The [original announcement on r/alienrpg](https://www.reddit.com/r/alienrpg/comments/seyrii/spoiler_chariot_of_the_gods_cronus_crew_access/) describes the intended play experience: players find a crew member's access card, scan its QR code or follow its link, and read that person's mail on a phone or at a shared computer representing an in-game terminal.

The GM decided where those physical cards would appear. DapperDaveW suggested that living crew retain their cards, with other cards discoverable at adventure locations associated with their owners. The post also described plans for security-only maps, scientific records, command information and company-only material. These access-card interactions, the original crew-email material and the terminal presentation are credited to DapperDaveW. The original post remains the source for its specific interpretations of the adventure; they should not be mistaken for new writing by this fork's maintainer.

## MaciejLisCK's repository

**[MaciejLisCK](https://github.com/MaciejLisCK)** preserved and adapted the hosted terminal in the [upstream Alien-RPG-Chariot-of-the-Gods-Terminal repository](https://github.com/MaciejLisCK/Alien-RPG-Chariot-of-the-Gods-Terminal). That project made the terminal available as a static site and included crew-access links, pictures, sounds, interactive deck maps and references to translated branches. Its development history includes access-code handling, additional content, map improvements and README contributions.

The upstream README explicitly described its copy as potentially incomplete or different from the original website because not all scripts and content could be downloaded easily. This fork inherits that preservation history. Credit for the original website and writing belongs to DapperDaveW; credit for the repository adaptation and its subsequent upstream contributions belongs to MaciejLisCK and the upstream contributors. Inclusion of an inherited asset here does not imply that it was created by this fork.

## This fork

**[pgotsis/Alien-RPG-Chariot-of-the-Gods-Terminal](https://github.com/pgotsis/Alien-RPG-Chariot-of-the-Gods-Terminal)** continues that work as a running application for GM-managed sessions. It replaces the static interface with Vue, adds a Fastify backend and persistent SQLite tables, separates ship/scenario data from application code, and adds the live editing, roster, blueprint, navigation and prepared-event features listed above.

The **ALIEN Roleplaying Game** and **Chariot of the Gods** are published by [Free League Publishing](https://freeleaguepublishing.com/) under license for the ALIEN setting. Credit for the setting and adventure remains with their respective creators and rights holders. This repository is a fan-made game aid built on those works and on the community contributions credited above.
