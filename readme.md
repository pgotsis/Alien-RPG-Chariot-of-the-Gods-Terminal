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

`DATA_DIR` is required. Live state is a SQLite file per ship, `$DATA_DIR/<ship>/state.sqlite`, and must sit outside the web root. `dist/` is the terminal the browser loads. `data/<ship>/ship.json` is the scenario shipped with the app (roster, mail, decks, tasks, and the starting status). Old pages and puzzle scripts for a ship stay under that ship's folder and are not served. The plaintext pin list is `gm/<ship>/pins.json` and is not served.

A task is a piece of work on that ship. A puzzle is a task with `"kind": "puzzle"`. The terminal lists tasks the clearance can see. It does not run a procedure: until a task names one, the station says none is installed. Cronus has no tasks. Astraeus is `?ship=astraeus`, with its puzzles filed under `data/astraeus/tasks/`.

The first request copies roster status, systems, announcements, and logs from the scenario into SQLite. After that, those four are the live copy every terminal reads. Mail, notes, files, rooms, and decks still come from `ship.json`. Set `GM_TOKEN` to change live state:

```
curl -sS -X PATCH -H "Authorization: Bearer $GM_TOKEN" -H "Content-Type: application/json" \
  -d "{\"roster\":{\"c-reynolds\":{\"status\":\"Deceased\"}}}" \
  http://127.0.0.1:3000/api/ships/cronus/state
```

With a prefix, that path is under the prefix too. Terminals pick up the change within about 15 seconds. Login and station notes stay in the browser.

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

# Demo
https://maciejlisck.github.io/Alien-RPG-Chariot-of-the-Gods-Terminal/src/

The terminal loads a ship file and speaks as that ship's MU/TH/UR. Cronus is the default. Another ship is `?ship=name` (reads `data/<name>/ship.json`) or `?data=https://example.com/ship.json`.

The login screen lists the crew. A card still signs straight in with `?code=` — that URL is what a QR code should encode. Pins are stored as salted SHA-256 hashes. The plaintext list for printing cards is `gm/cronus/pins.json`, which the terminal never loads.

Set `photo` on an account to an image path to show a portrait. `classifiedStatus` is shown only to clearances marked `rosterDetail`. A visitor account uses `external`, `listed: false`, and `restrictTo` for a limited pass.

Public access (players may try an obvious code): [1111](https://maciejlisck.github.io/Alien-RPG-Chariot-of-the-Gods-Terminal/src/index.html?code=1111) or [1234](https://maciejlisck.github.io/Alien-RPG-Chariot-of-the-Gods-Terminal/src/index.html?code=1234).

# Languages
* [English](https://github.com/MaciejLisCK/Alien-RPG-Chariot-of-the-Gods-Terminal/tree/main) on main branch.
* [Polish](https://github.com/MaciejLisCK/Alien-RPG-Chariot-of-the-Gods-Terminal/tree/feature/polish-language)
* [German](https://github.com/MaciejLisCK/Alien-RPG-Chariot-of-the-Gods-Terminal/tree/feature/german-language)

# Informations
This is a copy of [the site](https://www.experimentalgamer.com/AlienRPG/ChariotOfTheGods/Terminal)

The [original post](https://www.reddit.com/r/alienrpg/comments/seyrii/spoiler_chariot_of_the_gods_cronus_crew_access/) by [DapperDaveW](https://www.reddit.com/user/DapperDaveW/)

Some of scripts and content may be missing/different then on the site, since there is no easy way to download all.
Code is extremely difficult to maintain.


# Access shortcuts
Idea is there are access codes that could be found on different places, so players can access terminal with code. Below there are shortcuts to access those codes.

* [Public - code: 1111](https://maciejlisck.github.io/Alien-RPG-Chariot-of-the-Gods-Terminal/src/index.html?code=1111)
* [C.Reynolds - code: 8654](https://maciejlisck.github.io/Alien-RPG-Chariot-of-the-Gods-Terminal/src/index.html?code=8654)
* [A. Johns - code: 1987](https://maciejlisck.github.io/Alien-RPG-Chariot-of-the-Gods-Terminal/src/index.html?code=1987)
* [V. Reid - code: 2654](https://maciejlisck.github.io/Alien-RPG-Chariot-of-the-Gods-Terminal/src/index.html?code=2654)
* [D. Cooper - code: 4987](https://maciejlisck.github.io/Alien-RPG-Chariot-of-the-Gods-Terminal/src/index.html?code=4987)
* [L. Flynn - code: 3321](https://maciejlisck.github.io/Alien-RPG-Chariot-of-the-Gods-Terminal/src/index.html?code=3321)
* [L.Clayton - code: 9321](https://maciejlisck.github.io/Alien-RPG-Chariot-of-the-Gods-Terminal/src/index.html?code=9321)
* [Ava - code: 5654](https://maciejlisck.github.io/Alien-RPG-Chariot-of-the-Gods-Terminal/src/index.html?code=5654)
* [R.Walker - code: 6321](https://maciejlisck.github.io/Alien-RPG-Chariot-of-the-Gods-Terminal/src/index.html?code=6321)
* [E.Tenwick - code: 7987](https://maciejlisck.github.io/Alien-RPG-Chariot-of-the-Gods-Terminal/src/index.html?code=7987)

# Other materials
* [Alternative Map for Players](https://maciejlisck.github.io/Alien-RPG-Chariot-of-the-Gods-Terminal/src/images//USCSSCronusPlayerMap.png)
* [Alternative Map for GM(Mother)](https://maciejlisck.github.io/Alien-RPG-Chariot-of-the-Gods-Terminal/src/images//USCSSCronusGMMap.png)
* [Combat flow charts](https://imgur.com/a/alien-rpg-combat-flowcharts-v2-HeIA1Pt)

# Original post on reddit
>TL;DR Log on to the access terminal as Security Officer Clark Reynolds to try it out: https://www.experimentalgamer.com/AlienRPG/ChariotOfTheGods/Terminal/index.html?id=8654
>
>This is a follow up to the Cronus Crew emails I wrote in an earlier thread (https://www.reddit.com/r/alienrpg/comments/se3w5x/spoiler_chariot_of_the_gods_crew_emails_supplement/). I have now built an online access card and email interface system using javascript and CSS supplement to use with Chariot of the Gods.
>
>**How Does It Work** Members of the Cronus crew have personal access cards allowing them to check their emails at access terminals on the ship (later I will show how these access cards can unlock doors and access other ship sensitive data)
>
>**Do I have to Download Something?** No, the system is hosted on my web space. Just provide the QR codes or links to your players when their characters find the "access cards." Then they can view that user's terminal access using their mobile devices. Or you can alternatively just use a computer.
>
>**QR Codes** The system uses QR codes which contain a url and an id code for that user. You can view the QR codes here. https://www.experimentalgamer.com/AlienRPG/ChariotOfTheGods/Terminal/QRCodeImage.png
>So you can print and cut these out to make little access cards. In the future I will make nicer looking cards. Players can use their phones to follow the QR code and automatically log into that NPCs account (although their character must be at an "access terminal" on the ship)
>If you don't want to use QR codes you can just follow these links directly:
> * A. Johns https://www.experimentalgamer.com/AlienRPG/ChariotOfTheGods/Terminal/index.html?id=1987
> * V. Reid https://www.experimentalgamer.com/AlienRPG/ChariotOfTheGods/Terminal/index.html?id=2654
> * L. Flynn https://www.experimentalgamer.com/AlienRPG/ChariotOfTheGods/Terminal/index.html?id=3321
> * D. Cooper https://www.experimentalgamer.com/AlienRPG/ChariotOfTheGods/Terminal/index.html?id=4987
> * Ava https://www.experimentalgamer.com/AlienRPG/ChariotOfTheGods/Terminal/index.html?id=5654
> * R.Walker https://www.experimentalgamer.com/AlienRPG/ChariotOfTheGods/Terminal/index.html?id=6321
> * E.Tenwick https://www.experimentalgamer.com/AlienRPG/ChariotOfTheGods/Terminal/index.html?id=7987
> * C.Reynolds https://www.experimentalgamer.com/AlienRPG/ChariotOfTheGods/Terminal/index.html?id=8654
> * L.Clayton https://www.experimentalgamer.com/AlienRPG/ChariotOfTheGods/Terminal/index.html?id=9321
>
>**Where Are These Access Cards Found?**
>-It's up to the GM but I suggest that all living characters still possess their cards.
>-Captain Richard Walker's card is found near the Abomination in the Metapod (this abomination, I decided, is what remains of the good captain. As you can see from the email exchanges)
>-C. Reynolds is found on the "headless man" reference in GM material - likely the first dead body the players encounter.
>-Emily Tenwick's card can also be found in a science lab, or anywhere you feel she met her demise.
>
>**What's Next** Next I want to create an interactive security map of the ship that can be accessed by only security members (Reynolds, Reid). Then science data from Researchers, operation data from commanders and finally Company only data for Clayton.
>
>**EDIT:** I now see that I've been calling the Cronus the "Cronos". Likely other mistakes to fix as well.
>
