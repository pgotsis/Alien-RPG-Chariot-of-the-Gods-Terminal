/////////////////////ASTRAEUS////////////////////////////

		var astraeus = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle">ASTRAEUS</div>\
		<div class="dataimage"><img class="dataimg" src="images/astraeus.png"></div>\
		<div class="datacontent">The Astraeus is a Gallivant Class Starship operated by Galactic Concordant officers.  Named after the Greek god of stars and astrology, this ship’s primary purpose is deep space exploration and research.  \
		<br /><br />The Astraeus is equipped with a Xenospace Drive for faster-than-light travel across the galaxy, as well as a basic weapons system for defense.\
		</div>\
	<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 480; font-size: 28; left: 350;height: 50;" onclick="StartContent(\'crew\');">Crew</button>\
	<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 480; font-size: 28; left: 125;height: 50;" onclick="StartContent(\'mission\');">Mission</button>\
	<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 550; font-size: 28; left: 350;height: 50;" onclick="StartContent(\'status\');">Status</button>\
	<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 550; font-size: 28; left: 125;height: 50;" onclick="StartContent(\'systems\');">Systems</button>\
	';

	var crew = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle">ASTRAEUS</div>\
		<div class="dataimage"><img class="dataimg" src="images/astraeus.png"></div>\
		<div class="datacontent">\
		<table class="tablecontent">\
		<tr><td><img class="badge" src="images/vargasbadge.png"></td><td>CAPTAIN: <br />JUDD VARGAS</td>\
		<td><img class="badge" src="images/holtzbadge.png"></td><td>CHIEF ENGINEER: <br />DALTON HOLTZ</td></tr>\
		<tr><td><img class="badge" src="images/buchananbadge.png"></td><td>SCIENCE OFFICER: <br />ALAINE BUCHANAN</td>\
		<td><img class="badge" src="images/shimakibadge.png"></td><td>COMBAT OFFICER: <br />RIKU SHIMAKI</td></tr>\
		<tr><td><img class="badge" src="images/inbibibadge.png"></td><td>XENOSPACE OPERATOR: <br />INBIBI ASOON</td>\
		<td><img class="badge" src="images/rorobadge.png"></td><td>ASTRO ROVER: <br />"RO-RO"</td></tr>\
		</table>\
		</div>\
		<div>\
		<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 480; font-size: 28; left: 350;height: 50;" onclick="StartContent(\'astraeus\');">Astraeus</button>\
	<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 480; font-size: 28; left: 125;height: 50;" onclick="StartContent(\'mission\');">Mission</button>\
	<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 550; font-size: 28; left: 350;height: 50;" onclick="StartContent(\'status\');">Status</button>\
	<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 550; font-size: 28; left: 125;height: 50;" onclick="StartContent(\'systems\');">Systems</button>\
	';

		var systems = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle">ASTRAEUS</div>\
		<div class="dataimage"><img class="dataimg" src="images/bridgecontrols.png"></div>\
		<div class="datacontent">\
		<font color=#8620f5>Request Weapons Control:</font> Asks permission to enable the weapon constrol stick. \
		<br /><br /><font color=#f78420>Open Hailing Frequencies: </font> Press to answer a hail or contact another ship.\
		<br /><br /><font color=#4ef421>Engage Xenospace Drive: </font> Attempts to jump the ship to the coordinates set up in the Xenospace Drive.\
		<br /><br /><font color=#2084f6>Engage Transmitter Array: </font> Sends or receives object from the Transmitter Array.\
		</div>\
		<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 480; font-size: 28; left: 350;height: 50;" onclick="StartContent(\'astraeus\');">Astraeus</button>\
	<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 480; font-size: 28; left: 125;height: 50;" onclick="StartContent(\'mission\');">Mission</button>\
	<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 550; font-size: 28; left: 350;height: 50;" onclick="StartContent(\'status\');">Status</button>\
	<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 550; font-size: 28; left: 125;height: 50;" onclick="StartContent(\'crew\');">Crew</button>\
	';

		var status = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle">ASTRAEUS</div>\
		<div class="dataimage"><img class="dataimg" src="images/astraeus.png"></div>\
		<div class="datacontent">Damage incurred from encounter with Urbraxian Corpse Vessel\
		<font color="ef433a">\
		<ul><li><font color="ef433a">Lucidite Reserves: 0%</li>\
		<li>Impulse Engine Ruptured</li>\
		<li>Shields at 0%</li>\
		<li>Xenospace Configuration data loss</li>\
		<li>Combat Officer - Deceased</li>\
		</ul></div>\
		<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 480; font-size: 28; left: 350;height: 50;" onclick="StartContent(\'astraeus\');">Astraeus</button>\
	<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 480; font-size: 28; left: 125;height: 50;" onclick="StartContent(\'mission\');">Mission</button>\
	<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 550; font-size: 28; left: 350;height: 50;" onclick="StartContent(\'crew\');">Crew</button>\
	<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 550; font-size: 28; left: 125;height: 50;" onclick="StartContent(\'systems\');">Systems</button>\
	';


		var mission = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle">MISSION</div>\
		<div class="dataimage"><img class="dataimg" src="images/impon7.png"></div>\
		<div class="datacontent">\
		The Galactic Concordant has commanded the crew of the Astraeus to venture to XCD-14 to conduct zoological research on Impon VII, an uninhabited jungle planet containing rich wildlife.\
		<br /><br />During the mission the crew discovered an unknown alien temple containing an artifact. \
		<br /><br />Captain Vargas abruptly ended the mission and the crew returned to the Astraeus with the artifact.\
		</div>\
		<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 500px" onclick="StartContent(\'mission2\');">Next</button>\
		';


		var mission2 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle">MISSION</div>\
		<div class="dataimage"><img class="dataimg" src="images/corpsevessel.png"></div>\
		<div class="datacontent">\
		The Astraeus was then ambushed by an Urbraxian Corpse Vessel demanding the artifact.  It is unknown how the Urbraxians became aware of the artifact, however Combat Officer Shimaki surmises the Urbraxians utilized their Xenophoton Networking System to quickly communicate.\
		<br /><br />The Atraeus attempted to engage its Xenospace Drive and escape, but the ship was damaged before the jump could be completed. With its lucidite depleted in the failed jump, the Astraeus fled using full impulse engines.\
		</div>\
		<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 500px" onclick="StartContent(\'mission3\');">Next</button>\
		';

		var mission3 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle">MISSION</div>\
		<div class="dataimage"><img class="dataimg" src="images/stars.gif"></div>\
		<div class="datacontent">\
		Temporary eluding the Urbraxians, Captain Vargas ordered the remaining crew flee the ship using escape capsules.\
		<br /><br />Captain Vargas elected to remain on the ship, keeping it in minimal power mode to prevent the pursuing Urbraxians from honing in on its location.\
		</div>\
		<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 480; font-size: 28; left: 350;height: 50;" onclick="StartContent(\'astraeus\');">Astraeus</button>\
	<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 480; font-size: 28; left: 125;height: 50;" onclick="StartContent(\'crew\');">Crew</button>\
	<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 550; font-size: 28; left: 350;height: 50;" onclick="StartContent(\'status\');">Status</button>\
	<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 550; font-size: 28; left: 125;height: 50;" onclick="StartContent(\'systems\');">Systems</button>\
	';

////////////////////////////////////
