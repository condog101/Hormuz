// Big Don's line bank. Big Don is a parody of Donald Trump; every line here is
// fictional satire written for this game, posted in the cadence of a 3 AM tweet.
// None are real quotes and no real lyrics are quoted. The same goes for the guest
// features (GUESTS below): the Ice Cube, 2Pac, Snoop Dogg and Dr. Dre lines are
// invented for the game, caricatures not quotes. Swear words are written as {word}
// and ALWAYS rendered bleeped (see renderLine); the censorship is part of the joke.
// In-game lines stay at or under 150 characters so they fit the phone card
// (tests/quotes.test.ts). Longer story copy lives in story.ts.

export type QuoteTag =
  | 'random'
  | 'start'
  | 'damage'
  | 'lowHull'
  | 'bossIntro'
  | 'boss'
  | 'death'
  | 'clear'
  | 'victory'
  | 'streak'
  | 'pickup'
  | 'driveBy'
  | 'weapon'
  | 'diss';

export interface Quote {
  text: string;
  tags: QuoteTag[];
}

/** Tags where Big Don rests on the shades-and-grin portrait frame. */
export const HYPE_TAGS: ReadonlySet<QuoteTag> = new Set<QuoteTag>(['boss', 'clear', 'victory', 'streak', 'diss']);

export type GuestKey = 'cube' | 'pac' | 'snoop' | 'dre';

/** A guest's line and Big Don's answer to that exact line. */
export interface Exchange {
  guest: string;
  don: string;
}

/** Guest features: who they are, their portrait frame in guests.png, the buff they bring, and the back-and-forth with Don. */
export const GUESTS: Record<GuestKey, { name: string; frame: number; buff: string; exchanges: Exchange[] }> = {
  cube: {
    name: 'ICE CUBE',
    frame: 0,
    buff: 'ICE COLD',
    exchanges: [
      {
        guest: 'I did not sign off on this feature. My manager did. Anyway. Shoot straight, captain.',
        don: 'Cube LOVES me. His manager told me. Great manager! Very smart. Thank you for your attention to this matter!',
      },
      {
        guest: 'Don said one take. This is take forty. You have eight seconds. Make them count.',
        don: 'It was ONE take. Forty is a number the FAKE NEWS made up. I counted. One!',
      },
      {
        guest: 'I am here for the boat, not for Don. Keep the gun level and quit wasting rounds.',
        don: 'Cube says he is here for the boat. I AM the boat. Sad that he does not know that. JUST WATCH!',
      },
      {
        guest: 'Cold hands, steady aim. Nobody touches you for a minute. Use it.',
        don: 'I invented cold. Ask anybody. People say Don, you are the coldest. I say I know. Thank you!',
      },
      {
        guest: 'Don wants a writing credit on my verse. He gets nothing. You get covering fire. Go.',
        don: 'I wrote the BEST part of that verse. The pause. Nobody pauses like me. Credit coming soon!',
      },
      {
        guest: 'Pac is alive? Sure, Don. And I am a mime. Shoot the boats, captain.',
        don: 'Cube is a GREAT mime. Very quiet. Too quiet. Pac is ALIVE. My nephew saw him. JUST WATCH!',
      },
    ],
  },
  pac: {
    name: '2PAC',
    frame: 2,
    buff: 'DOUBLE UP',
    exchanges: [
      {
        guest: "Captain, it's Pac. Calling from the studio on Qeshm. Don't tell Don I called. Here, take some hull.",
        don: 'PAC CALLED! Live! From captivity! Totally rescued already, almost. Thank you for your attention to this matter!',
      },
      {
        guest: 'I got one bar of signal and a lot of verses. Doubling up your points. Keep it quiet.',
        don: 'Pac is sending SECRET MESSAGES. Only to me. Very top secret. I will now tweet them all.',
      },
      {
        guest: "Don thinks this is his album. It's yours. The water knows it too. Let them hear it.",
        don: 'Pac said it is MY album. I heard it. Everybody heard it. Great signal on that call. Tremendous!',
      },
      {
        guest: "Studio's nice. Pool, iced tea, a view. Anyway, the boats are coming. I got you.",
        don: 'They are TORTURING him with iced tea! Terrible! Inhumane! We are coming, Pac. JUST WATCH!',
      },
      {
        guest: 'Tell Don his chains are heavier than his bars. Then tell those boats goodbye.',
        don: 'My chains are VERY heavy. The heaviest. Doctors are amazed I can stand. Pac knows. Sad!',
      },
      {
        guest: 'Twenty-nine years on one album. Almost done. Make some noise out there, I need the drums.',
        don: 'He is making an album about ME. The rescue album. Number one, guaranteed. Thank you!',
      },
    ],
  },
  snoop: {
    name: 'SNOOP',
    frame: 4,
    buff: 'LAID BACK',
    exchanges: [
      {
        guest: 'Ayy, captain. Slow it down, nephew. Everything out there just got real relaxed.',
        don: 'Snoop called ME nephew? I have a nephew. Great kid. Saw Pac. Big fan of Snoop. Thank you!',
      },
      {
        guest: 'Fo shizzle. Them boats moving like Sunday morning now. Take your time.',
        don: 'I do not know what a shizzle is. Nobody knows more about shizzles than me. Believe me!',
      },
      {
        guest: "Don asked me for a feature. I said I'd do it if he stopped tweeting. He's tweeting right now.",
        don: 'I have NEVER tweeted during a feature. This is not a tweet. It is a post. Very different. Sad!',
      },
      {
        guest: 'Laid back, with my mind on the strait and the strait on my mind. Easy now.',
        don: 'Snoop wrote that about ME. Laid back. Nobody is more laid back than me. I am VERY calm!!!',
      },
      {
        guest: 'Pac called me too, you know. Told me he is fine. Said stop letting Don tweet.',
        don: 'FAKE CALL. Pac would never say that. He is a prisoner. A prisoner of iced tea. JUST WATCH!',
      },
      {
        guest: "Slow motion out there, captain. Like a video. Don't spill nothing.",
        don: 'Slow motion! Like my music video. Everyone said Don, too much slow motion. Wrong! Thank you!',
      },
    ],
  },
  dre: {
    name: 'DR. DRE',
    frame: 6,
    buff: 'THE DOCTOR',
    exchanges: [
      {
        guest: 'The doctor is in. Hull is getting patched while you sail. Hold still. Actually, do not.',
        don: 'Dre is my DOCTOR now. Best doctor. Says I am the healthiest rapper in history. Thank you!',
      },
      {
        guest: 'I mixed this whole strait. The low end on those shore guns is a mess. Fixing your hull, though.',
        don: 'Dre mixed it, I MASTERED it. Mastering is the important part. Very technical. Very me.',
      },
      {
        guest: "Don, we are not friends. Captain, you're doing fine. Keep breathing.",
        don: 'Dre says we are not friends. We are BEST friends. That is a whole different category. Sad!',
      },
      {
        guest: 'Took me ten years to finish an album once. Pac is at twenty-nine. He is fine, Don.',
        don: 'NOT FINE. Twenty-nine years in a studio. No windows. One window. A nice window. JUST WATCH!',
      },
      {
        guest: 'Turn the bass up on your hull. Patching it as we go. Patient is stable.',
        don: 'Patient is STABLE. Like a genius. A very stable genius. Dre said that. Basically. Thank you!',
      },
      {
        guest: 'Keep your head down and your levels up. I got the hull. You got the boats.',
        don: 'Dre has the hull, I have the vision, you have the boat. Best team ever assembled. JUST WATCH!',
      },
    ],
  },
};

/** Hype-man ad-libs popped over kills. */
export const ADLIBS = ['YEAH!', 'WHAT!', 'UH!', 'OKAAAY!', 'SKRRT!', 'BRRRAP!'];

const q = (tag: QuoteTag, lines: string[]): Quote[] => lines.map((text) => ({ tags: [tag], text }));

export const QUOTES: Quote[] = [
  ...q('random', [
    'PAC IS ALIVE. Have said it for years. Nobody listened. Now everybody is listening. Sad it took so long!',
    'My nephew saw Pac at a petrol station on Qeshm. Buying iced tea. Peach. My nephew does not lie. Great kid!',
    "MINISTRY RECORDS, the Ayatollah's label, has had Pac in a studio since '96. Longest session in history. TOTAL DISGRACE!",
    'Dre called me. Said Don, nobody has flow like you. I said I know, Dre. I know. Thank you!',
    'Many people are saying this is the best strait. The straightest. Not straight. STRAIT. Write that down.',
    'I was in the booth this morning. One take. The engineer cried. Big guy. Cried like a baby. TRUE!',
    'Is the boat bouncing? Hit the {damn} switches. Every great ship has hydraulics. Look it up!',
    'East Coast, West Coast, does not matter. We are the GULF COAST now. Nobody has ever done that. Nobody!',
    'I wrote a diss track about the strait. The strait has not responded. SCARED. {Shit} scared.',
    'Platinum chains. Two of them. For the boat. Somebody measure the boat. JUST WATCH!',
    'The opps are out there, captain. I know opps. I have the best opps. Beautiful opps. Shoot them!',
    'Quick question. Does the boat have a DJ? It should have a DJ. Get a DJ. Thank you!',
    'They told me the gun is five inches. Five. In the song we say nine. Nobody checks. NOBODY!',
    'I am watching on FOUR televisions. You look bigger on the big one. Like a music video. Tremendous!',
    'Gold records. Wall to wall. I am getting another wall. Bigger wall. Beautiful wall. For the records.',
    'Just got off with the chart people. They said we are number one. I said number one WHAT. They hung up. RUDE!',
    'Ratings on this rescue are {damn} incredible. Highest rated rescue in history. Maybe ever!',
    'Who is in charge of ad-libs on this boat? Nobody? SAD! I will do them myself. YEAH.',
    'People ask me, Don, why Hormuz. Because it rhymes with nothing. Nobody can bite it. VERY SMART!',
    'Where the {hell} is my DJ? I asked for a DJ three miles ago. This is a {damn} disgrace!',
    'The Ayatollah signed the Bloods AND the Crips. Same label. Same boats. Not even I did that. Sad!',
    'I sent the Ayatollah my demo. He sent it back. UNOPENED. Who the {hell} returns a demo?',
    'MINISTRY RECORDS is a terrible name for a label. Low energy. My label is a palace. Gold toilets. Two!',
    'The Bloods and the Crips used to hate each other. Now they both hate me. That is called UNITY. I did that!',
    'Pac has been making ONE album for 29 years. Nobody is that slow. Unless he is a prisoner. He is. JUST WATCH!',
    'They say Pac is not on Qeshm. FAKE NEWS. My nephew has photos. Blurry photos. The best kind!',
    'When we rescue Pac I will be on the album. Track one. Maybe all the tracks. He will be thrilled. Believe me!',
    'Iced tea at a petrol station. That is a cry for help. Read between the lines, people!',
    "Dre says we are not friends. Snoop says we are 'cool'. Cube says nothing. That is called RESPECT.",
    'If you are reading this, Pac, hang on. Big Don is coming. Not personally. Very busy. But spiritually!',
  ]),
  ...q('start', [
    'Track one. We open hard. No skits. I hate skits. Go. JUST WATCH!',
    'Hit record. Red light is on. Everything you do is on the {damn} album now. Do something GOOD.',
    'Here is the plan. Go through the strait. Shoot the opps. Save Pac. Do not die. Beautiful plan!',
    'New track, same strait. Pac is that way. East. Right side of the map. Where the hook is!',
    'This is the big one. The single. Every track is the single. But this one is MORE single.',
    'I told the label we would rescue Pac by Friday. It is Friday. Go fast. Thank you!',
    'Drop the beat. Drop the anchor. NO. Not the anchor. Just the beat. Go!',
    'I have spoken to the strait personally. It respects us. Mostly. Run it, captain!',
    'The {damn} intro is over. Verse one. Pac is listening. Do not fumble the first bar!',
  ]),
  ...q('damage', [
    'That is not damage, that is a scratch. We buff it out. We have guys. The BEST buffers.',
    'Who the {hell} is shooting at my boat? Find out. Then shoot them. In that order!',
    'Was that us? That looked like us. Make it not be us next time. Sad!',
    'Nobody told me the beach could shoot back. Who the {hell} builds a beach like that?',
    'The paint, captain. The candy paint. That was TWELVE coats. Twelve!',
    'Dodge! Left and right. Like a dance. You can dance. I believe in you. Somewhat.',
    'FAKE DAMAGE. The ship is fine. Tremendous condition. Is it on fire? Do not answer.',
    'Ouch. I felt that and I am very far away in a very nice booth.',
    'They hit the speaker stack. The SPEAKER STACK. Now it is personal!',
    'The {shit} they are throwing at us. Unbelievable. Throw it back. HARDER!',
  ]),
  ...q('lowHull', [
    'Captain, the boat looks tired. Boats cannot be tired. Find a gold record. They fix boats. I checked!',
    'Hull is low. I am NOT {damn} panicking. Tell the crew I am not panicking. Say it twice.',
    'Red light on the hull meter. Red is my colour. Still, make it green. QUICKLY!',
    'We are not going out like this. Not on this track. Pac is waiting. Find a pickup!',
    'I can see the {damn} water through the hull from here. From the booth. FIX IT!',
  ]),
  ...q('bossIntro', [
    'That big boat is MINISTRY RECORDS. Talking a lot of {shit}. End the conversation!',
    'Mothership. Big. Not as big as my boat but big. Shoot the bridge. They keep the beats on the bridge!',
    'They brought their own speakers. Those are MY speakers. Reclaim the speakers!',
    'This is the beef, captain. East versus West. Gulf versus whoever that is. WIN THE BEEF!',
    "That is the Ayatollah's label HQ. Floating. Bloods on one side, Crips on the other. Very rude!",
    'Everybody signed to MINISTRY RECORDS is on that boat. Sink it and the whole label folds. JUST WATCH!',
  ]),
  ...q('boss', [
    'That big boat was the rival label. No bars. Not one bar. SAD! Thank you for your attention to this matter!',
    'Mothership DOWN. I called it. I call everything. That is a hook now. Thank you for your attention!',
    'You sank the big one! I take full credit. You get a feature credit. Small font. Thank you!',
    'That was the {shit}, captain. Bleep that. Actually, leave it in. Thank you for your attention!',
    "MINISTRY RECORDS is sunk. Bloods, Crips, everybody swimming. Same colour now. Wet. JUST WATCHED!",
    'Label HQ, GONE. I am signing whoever floats. Tryouts on the beach. Tomorrow. Thank you!',
  ]),
  ...q('death', [
    'Pour one out. A big one. Then get another boat. We have like twelve.',
    'That one was DEFECTIVE. Somebody else built it. Get the next ship out there.',
    'Bad luck. Total bad luck. Not your fault. Well, a little your fault. Run it back!',
    'Album delayed. Rescue delayed. The label is calling. Not picking up. Get a new boat!',
    'The boat fell off. Boats do not fall off. Mine do not. That one was not mine. SAD!',
    '{Damn} it, captain. That was the good boat. The next one is also good. GO!',
  ]),
  ...q('clear', [
    'PLATINUM! Maybe double platinum. The chart people are calling. Thank you for your attention to this matter!',
    'Another {damn} one! The DJ is saying it. I am also saying it. ANOTHER ONE! Thank you!',
    'Perfect track. Absolutely perfect. I am told there were some holes. PERFECT holes. Thank you!',
    'Phenomenal. One track closer to Pac. I will shout you out on the outro. Thank you for your attention!',
    'That is a wrap. Mastered. Shipped. Certified. Next! Thank you for your attention to this matter!',
    'Hottest {damn} track in the Gulf. Mix it louder. LOUDER! Thank you for your attention!',
  ]),
  ...q('victory', [
    'Album of the year. Rescue of the year. Everybody is saying it. Thank you for your attention to this matter!',
    'WE DID IT. Open water. Certified diamond, maybe. Pac is on the boat. Probably. Thank you!',
    'Mission accomplished. HUGE banner. The biggest banner. Put my face on it. Thank you for your attention!',
  ]),
  ...q('streak', [
    'COMBO! That is what the kids say. Combo. I say it too. Combo. Thank you!',
    'Five in a row. Rapid fire. Like my bars. Many people compare them. JUST WATCH!',
    'Yeah! Okay! WHAT! Those are ad-libs. I do the ad-libs. You keep shooting. Thank you!',
    'Did you see that? Put it in the video. Slow motion. Then normal. Then slow again. TREMENDOUS!',
  ]),
  ...q('pickup', [
    'Gold record. On the water. Very wet record. Still counts!',
    'Certified gold record, captain. Hang it on the hull. Fix the hull with it. Both!',
    'A record in the water. Somebody is LEAKING the album. Pick it up. Investigate later.',
    'Free gold. I {damn} love free gold. Keep sailing, there is probably more!',
  ]),
  ...q('weapon', [
    'The nine. In the song it is a nine. Finally ACCURATE!',
    'A pump! Very loud. Very close. I like close. Get close to them and pump!',
    'The 808. That is a drum machine, captain. It explodes? EVEN BETTER. Put it on the beat!',
    'Switching guns mid-verse. Bold. VERY bold. I switch flows all the time. Nobody notices.',
  ]),
  ...q('driveBy', [
    'That is a drive-by, captain. A REAL one. Ours was a metaphor!',
    'Hydraulics! On the beach! Who paid for the road? I want to know who paid for the {damn} road!',
    'They are bouncing the car at us. Bounce the boat back. We have hydraulics too. I think. CHECK!',
    'A lowrider with a crew in it. Red bandanas. Or blue. I cannot tell from the booth. Shoot both!',
    'Beautiful car. Twelve coats. Shame. Shoot it anyway, captain. I will buy another one!',
  ]),
  ...q('diss', [
    'DISS TRACKS! Five of them! Guided! They find the opps BY THEMSELVES. Thank you for your attention to this matter!',
    'I wrote those diss tracks personally. Heat-seeking bars. The opps never had a chance. SAD for them!',
    'Five disses, five opps. That is called EFFICIENCY. Nobody disses like me. JUST WATCH!',
    'MINISTRY RECORDS just got dissed. Badly. They will need a whole album to respond. Thank you!',
    'Every diss track hits. Every one. Very accurate. More accurate than the FAKE NEWS!',
  ]),
];

/** Pick a line for `tag`, avoiding anything in `recent`. Returns the RAW text; callers render it. */
export function pickQuote(tag: QuoteTag, recent: string[]): Quote {
  let pool = QUOTES.filter((t) => t.tags.includes(tag) && !recent.includes(t.text));
  if (pool.length === 0) pool = QUOTES.filter((t) => t.tags.includes(tag));
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Render a raw line for display: every {word} becomes a run of asterisks the same length. */
export function renderLine(text: string): string {
  return text.replace(/\{([^}]*)\}/g, (_, w: string) => '*'.repeat(w.length));
}

/** True when the rendered character at `i` is part of a bleeped word. Lines never otherwise contain '*'. */
export function isBleeped(rendered: string, i: number): boolean {
  return rendered[i] === '*';
}
