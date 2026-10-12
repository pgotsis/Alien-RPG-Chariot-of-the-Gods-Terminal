
	class Room {
		constructor(Name, Description) {
			this.Name = Name;
			this.Description = Description;
		}
	}
	
	const Mother = new Room(
		"MU/TH/UR 2000",
		"Room only accessible with Command or Company access.",
	);
	
	const JunctionA1 = new Room(
		"Junction A1",
		"Main airlock open.  Umbilical detected. Deck access A-C.",
	);
	
	
	const AirScrubbers = new Room(
		"Air Scrubbers",
		"Air scrubbers operating at 20% efficiency due to accumulated pollutants.",
		// "Air scrubbers operating at 20% efficiency due to accumulated pollutants.  Cleaning required before Displacement drive can be engaged. <br /><br />Only accessible via ventilation and maintenance shafts. <br /> <br /> Carbon filters clean the air of pollutants while churning machines electrolyze the water and generate oxygen. <br /><br />WARNING: Electrolysis enabled. Risk of electrocution.",
	);
	
	const Stairwell = new Room(
		"Stairwell",
		"Allows access to all decks",
	);
	
	
	const EVAStorage = new Room(
		"Eva Storage",
		"Inventory: 3 EVA suits.",
	);
	
	const LeftShower = new Room(
		"Port Showers",
		"",
		// "Warning: fungal organisms detected.",
	);
	
	const RightShower = new Room(
		"Starboard Showers",
		"",
	);
	
	const JunctionA2 = new Room(
		"Junction A2",
		"Shaft leads to other levels of the ship.",
	);
	
	const Cryochambers = new Room(
		"Cryochambers 1-3",
		"",
		// "Five life signs detected. 2 Deceased.  4 Chambers empty.",
	);
	
	const ExaminationRoom = new Room(
		"Examination Room",
		"",
		// "Inventory: 2 Personal Medkits.",
	);
	
	const LeftElevator = new Room(
		"Port Elevator",
		""
		// "Accesses all decks of the ship.",
	);
	
	const RightElevator = new Room(
		"Starboard Elevator",
		""
		// "Elevator damaged and inoperable.",
	);
	
	
	
	const Vestibule1 = new Room(
		"Vestibule 1 (Armory)",
		""
		// "Inventory: 1 M41A Pulse Rifle. 1 case shotgun shells.",
	);
	const Vestibule2 = new Room(
		"Vestibule 2 (EVA Suits)",
		"",
		// "Inventory: 2 EVA suits",
	);
	const EscapePods = new Room(
		"4 Escape Pods",
		"",
		// "0/4 Remaining Escape Pods",
	);
	const Bridge = new Room(
		"Bridge",
		"Command Station - Status Operational Activates displacement drive (FTL).  Flight and crew records.. <br /><br />Holographic Display Table<br /><br />Sensor Station: Used for ship video surveillance of the ship.<br /><br/>Life Support Monitors - Analyze current life support system status. ",
		// "Command Station - Status Operational Activates displacement drive (FTL).  Flight and crew records.. <br /><br />Holographic Display Table - Destroyed<br /><br />Sensor Station: Used for ship video surveillance of the ship.  Currently needs repairs. <br /><br/>Life Support Monitors - Analyze current life support system status. ",
	);
	const JunctionB1 = new Room(
		"Junction B-1",
		"Access A-C via ladder.",
	);
	const MessHall = new Room(
		"Mess Hall",
		"",
	);
	const CorporateSuite = new Room(
		"Corporate Suite",
		"Company access required.  Escape pod fully operational.",
	);	
	const MedLab = new Room(
		"Med Lab",
		"Alien specimens contained.",
		// "Alien specimens contained. <br /><br />Medpod1 is damaged but operational. Medpod2 is in use.",
	);
	const ScienceLab1 = new Room(
		"Science Lab 1",
		"",
		// "Fungal organisms detected.",
	);
	const ScienceLab2 = new Room(
		"Science Lab 2",
		"",
	);
	const JunctionB2 = new Room(
		"Junction B-2",
		"Ladder allows access to other decks.",
	);
	const LivingQuarters = new Room(
		"Living Quarters",
		"",
		// "Fungal organisms detected.",
	);
	const ScienceModule = new Room(
		"Science Module",
		"Science module ejected from ship.",
		// "Science module ejected from ship.",
	);
	const ReactorCore = new Room(
		"Reactor Core",
		"Fission reactor core.",
	);
	
	
	
	const JunctionC1 = new Room(
		"Junction C-1",
		"Deck Access A-C.",
	);
	const LeftStorageUnit = new Room(
		"Port Storage",
		""
		// "Inventory:  7 Drums of quinitricetyline (WARNING: Highly Unstable)",
	);
	const RightStorageUnit = new Room(
		"Starboard Storage",
		"",
		// "Inventory: 2 bolt guns, 1 cutting torch, 1 maintenance jack.",
	);
	const CargoBay1 = new Room(
		"Cargo Bay 1",
		"Inventory: Food stores.",
	);
	const CargoBay2 = new Room(
		"Cargo Bay 2",
		"Inventory: Spare RV tires.",
	);
	const CargoOffice = new Room(
		"Cargo Office",
		"",
	);
	const JunctionC2 = new Room(
		"Junction C-2",
		"Access Decks A-C",
	);
	const CoolantTanks = new Room(
		"Coolant Tanks",
		"Coolant tanks prevent overloading.",
		// "Coolant tanks prevent overloading. <br /><br /> (Warning: Damaging coolant tanks could lead to reactor critical mass). <br /><br />Accessible via service tunnels.",
	);
	const Catwalk = new Room(
		"Catwalk",
		"Overlooks Deck D vehicle bay.",
	);
	const ReactorRelayControl = new Room(
		"Reactor Relay Control",
		"Alert: Relay disconnected from four fission engines. Unable to engage Displacement Drive (FTL) <br /><br />Warning: Radiation leak detected. <br /><br />Power from the four engine pods channel through the main relay here before being distributed to the rest of the ship. <br /><br />Forbidden area: Emergency self destruct accessible here.",
	);
	
	
	
	const VehicleBay = new Room(
		"Vehicle Bay",
		"Inventory: 2 ATVs",
	);
	const EQUShed = new Room(
		"EQU Shed",
		"",
	);
	const VehiclePartsStorage = new Room(
		"Vehicle Parts Storage",
		"",
	);
	const DispatchOffice = new Room(
		"Dispatch Office",
		"",
	);
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	class Email {
		constructor(Subject, To, From, Time, Content) {
			this.To = To;
			this.From = From;
			this.Subject = Subject;
			this.Time = Time;
			this.Content = Content;
		}
	}
	
	
	const LV1113Reached = new Email(
	"LV-1113 Reached", 
	"WYCorporate", 
	"L.Clayton", 
	"(3-5-2112 5:55 am)", '\
	The crew has woken up from hypersleep as the Cronus approaches the 26 Draconis system. Preliminary scans of LV-1113 reveal it to be a lush, jungle planet with plenty of lifeforms. The research team is preparing to deploy the science module.  Walker has asked the security team to accompany them.  The chemical agent may be down there, but there’s no telling what else is on the planet.\
	');
	
		const OriginOfChemical = new Email(
	"Origin of AO-3959X.91-15", 
	"L.Clayton", 
	"D.Cooper", 
	"(3-16-2112 7:55 am)", '\
	Just as the deciphered transmission led us to believe, we have found AO-3949X.91-15 here on LV-1113.  The science team has begun experimenting on the black liquid, dubbing it the “26 Draconis strain.”\
	<What is most interesting is that the chemical did not originate here, rather it was deployed here a long time ago.  It has even mutated the planet’s lifeforms.  Genetic testing on the egg sacs growing in the temple show that they were grown primarily from the 26 Draconis Strain.\
	<I’m uploading our analysis to the access terminal.\
	');
	
	const XenomorphAttack = new Email(
	"Xenomorph Attack", 
	"R.Walker", 
	"C.Reynolds", 
	"(3-17-2112 6:06 am)", '\
	It is my duty to report that Carter is dead.  It happened so fast I can hardly describe it.  At first he complained of migraines.  Then, blood started pouring out of him.  Then, Wright tried to administer aid, some kind of creature burst out of his body.  It cut up Wright pretty bad before I jerked it off of him. It ran off into the jungle.\
	<Cooper was able to find traces of spores that had infected Carter, entering his body and mutating his insides to grow that thing.  They came from the egg sacs we found.  Who knows who else is infected.\
	<Where in Middle Heavens are we?\
	');
	
	
	
	const UrgingEvacuation = new Email(
	"Urging Evacuation of LV-1113", 
	"R.Walker", 
	"V.Reid", 
	"(3-17-2112 3:11 pm)", '\
We’ve lost Carter, Wright, Garcia and Nguyen.\
<9 hours later, the creature that came out of Carter came back for the rest of us.  Now it was much bigger.  This time it tore Wright to shreds and was on Garcia before he could draw his rifle.  In a panic, we started open firing.  The creature finally went down, but Nguyen was hit in the crossfire.\
<Damn the company, we cannot stay on this rock another minute.  I am strongly urging you to recall the science team immediately and get every survivor off world and back on the Cronus.  If Clayton gives you a hard time, tell her she can stay down here.\
');


	const EggSacsOnShip = new Email(
	"Alert! EGG SACS on the SHIP", 
	"R.Walker", 
	"E.Tenwick", 
	"(3-19-2112 11:27 am)", '\
I don’t know how this could have happened but the same egg sacs we found on LV-1113 are now growing on the Cronus.  I wasn’t sure at first, but I saw a clutch of bird-sized eggs growing in the air scrubbers.  I may have already disturbed them and released the spores.\
<I thought we confirmed the Neomorphs don’t lay eggs?  So how did this happen? We\'ll all be incubators for those demons soon.\
');

	const ImInfected = new Email(
	"I’ve been Infected", 
	"L.Flynn", 
	"E.Tenwick", 
	"(3-19-2112 4:18 pm)", '\
I just confirmed it with a blood test. I’ve been infected.  There isn’t much time before a monster crawls out of me. I saw what happened to the others on LV-1113.  No thanks. \
<I donate what’s left me to science.  Kill me. Take it out of me. Study it.  Learn from it.  That’s all I have left to give.\
<I still don’t know how the egg sacs got on the ship.  But it’s only a matter of time before everyone is infected.  The motes are smaller than grains of sand.  They travel to the nearest potential host and zero-in on any unprotected orifice. \
<Maybe Flynn can whip up some kind of protection from it.  Do whatever it takes.  And do it fast, my head is killing me.\
');

	const UpdateOnPossibleCure = new Email(
	"Update on Possible “Cure”", 
	"R.Walker", 
	"L.Flynn", 
	"(3-20-2112 3:55 pm)", '\
I have made immense progress on a possible “cure” for those infected by the neomorph spores that have somehow found their way onto the Cronus.  I’ve tested it on my own infection and it quickly rendered the mutated cells in my body into a benign tumor.  I think we should begin distributing the inoculation immediately.  There is no time for further study.\
<This progress was made possible only by recovering the embryonic “bloodburster” we retrieved from Tenwick.   So we can take solace that she did not perish entirely in vain.\
<Furthermore, the inoculation may have further medicinal benefits beyond the scope of the spores, such as stopping some forms of cancer.  Despite the tragedies we endured here, perhaps there is a silver lining in all this.\
');

	const SideEffects = new Email(
	"Side Effects?", 
	"L.Flynn", 
	"R.Walker", 
	"(3-20-2112 6:19 pm)", '\
I know you’re busy but I’ve got some health issues I can’t ignore.  My skin is mottling and blotchy and I’m starting to feel sick.  If there was a monster growing in me, it would have killed me by now, so it must be something else.\
<You didn’t mention any side effects with the inoculation, but could that be it?  Everyone else seems fine.  \
<I’m going to try to get over to medical, if the coast is clear.\
');

	const Youkkkkk  = new Email(
	"(Draft) Youkkkkk iSELF", 
	"", 
	"R.Walker", 
	"(3-20-2112 1:47 am)", '\
FEEL ITCHY AND...AGGGG ..I SEE THE RED RIGHT?\
<…IT HURTS…WHO ARE YOU?  WAHT AM i NOW?\
');

	const YoureInCommandNow  = new Email(
	"You’re in Command Now", 
	"A.Johns", 
	"V.Reid", 
	"(3-21-2112 9:10 am)", '\
The Captain is dead.  I killed him.  You can court martial me when we get back to Earth if you want.  You can tear up my contract with WY for all I care.  \
<It had to be done.  He wasn’t himself anymore, he was a monster.  A threat to us all.  Unlike you, I’ve seen too much death. First on Torin Prime and now LV-1113.  Sometimes you have to make the hard decisions.\
<And now that you’re the new acting captain, you’ll be making a lot of hard decisions.  Between monsters bursting out of people and others turning into monsters themselves, there’ll be no shortage of sacrifices to be made to save what’s left of us.\
<Good luck to you.  You can depend on me to do whatever it takes to protect the Cronus.  Unless you want to throw me in the brig for mutiny.\
');

	const TellMeTheTruth  = new Email(
	"Tell Me The Truth", 
	"L.Flynn", 
	"D.Cooper", 
	"(3-21-2112 10:31 am)", '\
I just finished the initial dissection on that thing that was once Captain Walker.  I took a sampling of his DNA and found something that we should really discuss.\
<Flynn, I know things have gone to hell, but I need you to be honest with me.  Why didn’t you tell us that the “cure” was a derivative of the 26 Draconis strain?  \
<We’ve known each other a long time and I know you would do anything to save a life.  But did you ever consider that the “cure” itself was responsible for the captain’s mutation?  There is still so much we don’t know about AO-3959.91-15.  \
');

	const ReportToCryoChambers  = new Email(
	"ALL REMAINING PERSONNEL REPORT TO CRYOCHAMBERS IMMEDIATELY", 
	"CronusCrew", 
	"A.Johns", 
	"(3-21-2112 2:08 pm)", '\
We have lost control of the Cronus.  Every remaining crewman is ordered to report to the cryochambers immediately for the voyage back to Earth.  I have set the bridge to initiate total lockdown in 20 minutes.  \
<Once those doors are locked, we will be safe.  But only if you’re inside them.  The creatures will not be able to open the doors. Only someone with card access can open them.\
<Ava will continue to maintain the ship.  The xenomorphs seem to ignore her.  With any hope, we might actually make it.  \
<I did not make this decision lightly.  But as your acting captain, this was my decision. I expect you to comply.\
');

	const NotGoingToMakeIt  = new Email(
	"Not Going To Make It", 
	"A.Johns", 
	"C.Reynolds", 
	"(3-21-2112 2:20 pm)", '\
Well Johns, I almost made it to the cryochambers, as you ordered.  But I’m afraid to tell you that I won’t be making it.\
<My skin is mottling and blotchy, my vision is blurring and I feel like I just drank every last bottle of Walker’s stash of whiskey.  I know what’s happening to me.  Same thing that happened to Walker himself.  Soon I’ll become a danger to the crew.\
<Too bad.  I was so close to getting back to my wife and kids.\
<Rather than become an abomination, I’ve decided to end things here on my terms.  Take care. \
<This is Second Security Officer, Clark Reynolds, signing off.\
');

	const NeomorphLifeCycle  = new Email(
	"Neomorph Lifecycle Discovery", 
	"A.Johns", 
	"Ava", 
	"(3-28-2112 10:00 am)", '\
During my routine maintenance rounds, I encountered something quite fascinating.  The dead carcass of an adult neomorph creature is lying in the crew quarters.  It seems to have fallen from a vent in the ceiling.\
<What’s interesting is that it seems to have died of natural causes.  This is only 24 hours after it emerged from the spine of Officer Peters.  To be born, to grow, to kill, and to die - all in a single day.  Intriguing.\
<I ran several motion sensor scans across the entire ship and no movement has been picked up.  I am satisfied that there are no other xenomorphs on the ship.  They must have all died of natural causes.\
<I believe it is safe to wake you and the remaining crew from cryosleep.  But as long as I am able to maintain the ship myself, I will not disturb your slumber until we reach Earth. \
');

	const ImpactOfMicroMeteorStorm  = new Email(
	"Impact of Micro-Meteor Storm", 
	"A.Johns", 
	"Ava", 
	"(4-17-2112 2:08 pm)", '\
Unfortunately, I have some bad news to report regarding our voyage back to Earth.  We encountered a micro-meteor storm that damaged the comms array and caused navigation control to fail.  Lightspeed has been disengaged and we are now barreling along at sublight speed.\
<I attempted to repair the comms array myself on the exterior of the ship when I encountered an “abomination.”  Apparently, the ship is not free from danger as I previously reported.  The mutated crew members are still very much alive, they only entered a state of hibernation (I continue to maintain the belief that the neomorphs all still perished of natural causes within 24 hours) where they went undetected from my motion scans.\
<I ejected the “abomination”, which I believe to be our Chief Engineer Justin Walthorp, through the airlock.  But not before it smashed the side of my head with a wrench in a fit of rage.  \
<I may have suffered damage and I need to conduct a scan of my systems.\
');


	const Beeeeeep  = new Email(
	"(Draft) Beeeeeep", 
	"", 
	"Ava", 
	"(4-19-2112 11:55 pm)", '\
Metal bones.  Milk blood.  Do you hear them at the window?  \
<Cronus tells me.  It tells me things.\
<It’s not safe here.  But my animals will protect you Johns.  They are metal too.\
<I cannot see the stars.\
');


	const AndroidReactivation  = new Email(
	"Android Reactivation", 
	"CronusCrew", 
	"Ava", 
	"(4-20-2112 3:00 am)", '\
This is an automated entry from Walter-model android 215437.73, designated “Ava”.  This unit has begun to malfunction.  For the safety of any present human life, it will be self-deactivated.\
<If you wish to reactivate this unit, enter reactivation sequence B833J99.\
<Weyland-Yutani\
');


	const EmailList = [
	LV1113Reached, 
	OriginOfChemical, 
	XenomorphAttack, 
	UrgingEvacuation, 
	EggSacsOnShip,
	ImInfected,
	UpdateOnPossibleCure,
	SideEffects,
	Youkkkkk,
	YoureInCommandNow,
	TellMeTheTruth,
	ReportToCryoChambers,
	NotGoingToMakeIt,
	NeomorphLifeCycle,
	ImpactOfMicroMeteorStorm,
	Beeeeeep,
	AndroidReactivation,
	];