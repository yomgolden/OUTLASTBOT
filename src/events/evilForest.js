module.exports = {
  id: "evil_forest",
  name: "Evil Forest",
  icon: "🌿",
  location: "Benin Kingdom",
  danger: "EXTREME",
  tagline: "The forest takes what it is owed. It has always been owed.",

  atmosphere:
    "Legends spoke of gold buried deep in the forests of the Benin Kingdom. Greedy adventurers entered before sunrise. By nightfall, the paths behind them had vanished into fog. Strange drums echoed between the trees. The forest was never protecting treasure. It was feeding on those who searched for it.",

  roundConfig: {
    min: 5,
    max: 8,
  },

  // Round 1 only
  openingNarrative: [
    "You followed the old map deeper, even after the villagers begged you to turn back.",
    "The silence between the trees felt wrong from the very beginning.",
    "Your lantern flickered as the last path behind you disappeared into the fog.",
    "You stepped over broken warning signs as distant drums echoed somewhere ahead.",
    "You thought the stories were meant to scare tourists away. You were wrong.",
    "You entered with a rusted machete and a map stained with dried blood.",
  ],

  // Middle rounds
  midNarrative: [
    "I really thought this treasure was going to change my life.",
    "The deeper we go, the more this forest feels wrong.",
    "Nobody in the group says it out loud. But we are all terrified.",
    "I should have listened when they warned us about this place.",
    "Something inside these woods does not want us leaving alive.",
    "I cannot tell if we are searching for treasure or if something is leading us somewhere.",
    "The forest feels alive tonight. And it knows we are here.",
    "At this point I cannot even remember the way back.",
    "The gold stopped feeling important the moment the screaming started.",
    "Every step deeper feels like a mistake.",
    "I came here chasing riches. Now I just want to survive the night.",
    "The silence in this forest feels heavier than the darkness itself.",
    "Nobody has smiled since we entered.",
    "I have a feeling the treasure was only bait to bring people here.",
    "Every ruined statue we pass feels like a warning we ignored.",
  ],

  // Final round only
  closingNarrative: [
    "Only one can leave. The forest has always known this.",
    "The drums have been building to this moment all night.",
    "Whatever is left standing when dawn breaks — that is the one the forest chose.",
    "This is what the forest was feeding toward all along.",
    "The end was written before any of them entered the gates.",
  ],

  worldEvents: [
    "Distant ancestral drums called for fresh blood.",
    "The iroko trees shook violently as if possessed.",
    "Thick white fog swallowed the path in seconds.",
    "Something massive moved behind the sacred trees.",
    "The entire forest fell into deadly silence.",
    "The drums stopped — then beat from inside the trees.",
    "The earth trembled like an angry ancestor.",
    "A procession of headless warriors marched through the mist.",
    "A woman's voice sang a forgotten coronation song backwards.",
    "Burning eyes opened on the bark of ancient trees.",
    "A circle of glowing ancestral skulls rose from the mud.",
    "Whispers called each survivor by their mother's secret name.",
  ],

  survival: [
    "A deadly snake dropped from a branch, but {player} killed it just before it struck.",
    "{player} discovered a hidden stream and rushed to drink first.",
    "The muddy ground collapsed beneath {player}, forcing another survivor to pull them out.",
    "{player} almost fainted after touching what looked like a root. It moved.",
    "{player} found ancient coins near a ruined shrine.",
    "{player} used a burning branch to scare away something hiding in the dark.",
    "Strange markings carved into the trees were noticed first by {player}.",
    "The group froze when {player} whispered — 'Something is following us.'",
    "{player} heard whispers calling their name deep in the forest.",
    "{player} found an abandoned shrine and immediately started apologizing to everything.",
    "{player} refused to believe in curses — until their hair started moving on its own.",
  ],

  elimination: [
    "{victim} disappeared into the fog after following distant drum sounds alone.",
    "A hidden trap snapped beneath {victim}, dragging them deep underground.",
    "{killer} shoved {victim} toward the moving shadows and kept running.",
    "{victim} drank water from a shrine pool. Their eyes went white before they fell.",
    "{killer} whispered something in Hausa. {victim} walked straight into the forest and never came back.",
    "{victim} refused to pour libation at the old oak. The forest took payment anyway.",
    "A masquerade emerged from nowhere. {victim} could not look away. They walked toward it smiling.",
    "{killer} tied {victim} to a tree marked with red chalk and left them screaming.",
    "{victim} heard their own voice calling from deeper in the forest. They went to find it.",
    "{victim} found a fresh grave with their own name carved on it. They sat down and waited.",
    "A beautiful woman in white appeared on the path. {victim} followed her into the mist.",
    "{victim} laughed and said 'worst case scenario, I die in the forest.' The forest took notes.",
    "{killer} gave {victim} a choice. Both options led downward.",
    "The ancestors wanted something. {victim} offered apologies. Apologies do not feed the dead.",
    "The vines moved with intention. They wrapped around {victim} slowly, then all at once.",
    "{victim} was dragged into the undergrowth by pale hands.",
    "{killer} paid the forest something. {victim} became the price.",
    "{victim}'s reflection in the ritual mirror stepped out and took their place.",
    "The red clay rose up to fill {victim}'s lungs until they hardened into a statue.",
  ],

  winner: [
    "Morning finally reached the forest. Covered in dirt, blood, and ash, {winner} walked out alone.",
    "The drums suddenly stopped as {winner} crossed the forest border.",
    "The villagers froze when they saw {winner} return at sunrise. Nobody asked where the others were.",
    "Gold coins spilled from {winner}'s bag onto the muddy road. Surviving felt more valuable than the treasure.",
    "The Evil Forest spared {winner} tonight. But it never truly lets anyone leave.",
    "Far behind the trees, something screamed in frustration. {winner} kept walking.",
    "At sunrise, {winner} finally understood. The forest was never protecting treasure. It was feeding on greed all along.",
  ],
};
