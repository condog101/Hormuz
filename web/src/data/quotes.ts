// Big Don's line bank. Big Don is a parody of Donald Trump; every line here is
// fictional satire written for this game. None are real quotes and no real
// lyrics are quoted. Swear words are written as {word} and ALWAYS rendered
// bleeped (see renderLine); the censorship is part of the joke.

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
  | 'ciws'
  | 'driveBy';

export interface Quote {
  text: string;
  tags: QuoteTag[];
}

/** Tags where Big Don rests on the shades-and-grin portrait frame. */
export const HYPE_TAGS: ReadonlySet<QuoteTag> = new Set<QuoteTag>(['boss', 'clear', 'victory', 'streak']);

/** Hype-man ad-libs popped over kills and CIWS bursts. */
export const ADLIBS = ['YEAH!', 'WHAT!', 'UH!', 'OKAAAY!', 'SKRRT!', 'BRRRAP!'];

const q = (tag: QuoteTag, lines: string[]): Quote[] => lines.map((text) => ({ tags: [tag], text }));

export const QUOTES: Quote[] = [
  ...q('random', [
    "Captain, I am dropping the hottest album in history. 'Straight Outta Hormuz.' It is mostly about you. Do not make it a sad album.",
    'Dre called me. He said Don, nobody has flow like you. I said I know, Dre. I know.',
    'Many people are saying this is the best strait. The straightest. Not straight. Strait. We put that on a track. Track four.',
    'I was in the booth this morning. One take. The engineer cried. Big guy. Cried like a baby.',
    'Is the boat bouncing? Hit the {damn} switches. Hydraulics. Every great ship has hydraulics. Look it up.',
    'My hype man quit. He said I was too much hype for one {damn} man. True. Very true.',
    'East Coast, West Coast, it does not matter. We are the Gulf Coast now. Nobody has done that. Nobody.',
    'I wrote a diss track about the strait. The strait has not responded. Scared. {Shit} scared.',
    'Platinum chains. Two of them. For the boat. Somebody measure the boat.',
    'I want an Impala. On the deck. For the video. Do not ask what the video is for.',
    'The opps are out there, captain. I know opps. I have the best opps. Beautiful opps. Shoot them.',
    'Quick question. Does the boat have a DJ? It should have a DJ. Get a DJ.',
    'I have a feature on every track. People say Don, that is too many features. Wrong. There is no such {damn} thing.',
    'They told me the gun is five inches. Five. I said, in the song, we say nine. Nobody checks.',
    'Somebody told me there is oil coming through there. Lots of oil. Oil is the new platinum. Write that down.',
    'I am watching on four televisions. You look bigger on the big one. Like a music video. Tremendous.',
    'I was going to be a rapper. The best. I chose this instead. Sacrifice. Put that in the liner notes.',
    'Gold records. Wall to wall. I am getting another wall. Bigger wall. Beautiful wall. For the records.',
    'Does the boat have a gift shop? Hats. Chains. Little boats. Big markup. We are a label now.',
    'I just got off with the chart people. They said we are number one. I said, number one what. They hung up.',
    'The ratings on this transit are {damn} incredible. Highest rated strait in history. Maybe ever.',
    'My Impala has twelve-inch woofers. The boat has a five-inch gun. Think about that. I think about it all day.',
    'The critics said the first album was too long. This one is twenty-one miles. Let them cry.',
    'I asked the admirals for a beat. They gave me a map. Admirals do not understand the {damn} culture.',
    'Who is in charge of ad-libs on this boat? Nobody? Sad! I will do them myself. YEAH.',
    'Rival labels keep calling. I do not pick up. I let it ring. Let it ring, captain.',
    'People ask me, Don, why Hormuz. I say, because it rhymes with nothing. Nobody can bite it.',
    'Keep the camera on the boat. The boat is the star. I am also the star. Two stars.',
    'Where the {hell} is my DJ? I asked for a DJ three miles ago. This is a {damn} disgrace.',
    'The {shit} they are saying about my flow on the internet. Lies. My flow is perfect. Twenty-one miles of flow.',
  ]),
  ...q('start', [
    'Track one. We open hard. No skits. I hate skits. Go.',
    'Hit record. Red light is on. Everything you do is on the {damn} album now. Do something good.',
    'Okay, here is the plan. Go through the strait. Shoot the opps. Do not die. That is the whole verse. Beautiful verse.',
    'New track, same strait. Further along. Keep going that way. East. Right side of the map. Where the hook is.',
    'This is the big one. The single. Every track is the single. But this one is more single.',
    'Remember the three rules. Shoot the boats. Avoid the shells. Only call me with good bars.',
    'I told the label we would be done by Friday. It is Friday. Go fast.',
    'Drop the beat. Drop the anchor. No wait. Not the anchor. Just the beat. Go.',
    'I have spoken to the strait personally. It respects us. Mostly. Run it.',
    'The {damn} intro is over. Verse one. Do not fumble the first bar, captain.',
  ]),
  ...q('damage', [
    'That is not damage, that is a scratch. We buff it out. We have guys. The best buffers.',
    'Who the {hell} is shooting at my boat? Find out. Then shoot them. In that order.',
    'Was that us? That looked like us. Make it not be us next time.',
    'Nobody told me the beach could shoot back. Who the {hell} builds a beach like that. Sad!',
    'The paint, captain. The candy paint. That was twelve coats. Twelve.',
    'Dodge! You know dodging? Left and right. Like a dance. You can dance. I believe in you. Somewhat.',
    'That is fake damage. The ship is fine. Tremendous condition. Is it on fire? Do not answer.',
    'Ouch. I felt that and I am very far away in a very nice booth.',
    'They hit the speaker stack. The SPEAKER STACK. Now it is personal.',
    'The {shit} they are throwing at us. Unbelievable. Throw it back. Harder.',
  ]),
  ...q('lowHull', [
    'Captain, the boat looks tired. Boats cannot be tired. Find a gold record. They fix boats. I checked.',
    'Hull is low. I am not {damn} panicking. Tell the crew I am not panicking. Say it twice.',
    'Red light on the hull meter. Red is my colour. Still, make it green. Quickly.',
    'We are not going out like this. Not on this track. Not on any track. Find a pickup.',
    'I can see the {damn} water through the hull from here. From the booth. Fix it.',
  ]),
  ...q('bossIntro', [
    'That big boat is the rival label. They have been talking a lot of {shit}. End the conversation.',
    'Mothership. Big. Not as big as my boat but big. Shoot the bridge. They keep the beats on the bridge.',
    'The opps brought their own speakers. Those are my speakers. Reclaim the speakers.',
    'This is the beef, captain. East versus West. Gulf versus whoever that is. Win the beef.',
    'They put a satellite dish on it. For the leaks. They are leaking our album. Sink the {damn} leak.',
  ]),
  ...q('boss', [
    'That big boat was the rival label. No bars. Not one bar. Sad!',
    'Mothership down. I called it. I call everything. That is a hook now.',
    'You sank the big one! I am taking full credit. You can have some credit. Small credit. A feature credit.',
    'Rival label is underwater. Which is where they keep their money. Allegedly.',
    'That was the {shit}, captain. Bleep that. Actually, leave it in.',
  ]),
  ...q('death', [
    'Pour one out. A big one. Then get another boat. We have like twelve.',
    'That one was defective. Somebody else built it. Get the next ship out there.',
    'Bad luck. Total bad luck. Not your fault. Well, a little your fault. Run it back.',
    'Album delayed. Ugh. The label is calling. I am not picking up. Get a new boat.',
    'The boat fell off. Boats do not fall off. Mine do not. That one was not mine.',
    '{Damn} it, captain. That was the good boat. The next one is also good. Go.',
  ]),
  ...q('clear', [
    'Platinum! Maybe double platinum. The chart people are calling. I am not picking up.',
    'Another {damn} one! The DJ is saying it. I am also saying it. Another one.',
    'Perfect track. Absolutely perfect. I am told there were some holes. Perfect holes.',
    'Phenomenal. I will shout you out on the outro. Not by name. But in spirit.',
    'That is a wrap on that one. Mastered. Shipped. Certified. Next.',
    'Hottest {damn} track in the Gulf. Mix it louder. Louder than that.',
  ]),
  ...q('victory', [
    'Album of the year. Everybody is saying it. Straight outta Hormuz, baby.',
    'We did it. Open water. Certified. Diamond, maybe. I am buying a bigger wall.',
    'Mission accomplished. Big banner. Huge banner. The biggest banner. Put the album cover on the banner.',
  ]),
  ...q('streak', [
    'Combo! That is what the kids say. Combo. I say it too. Combo.',
    'Five in a row. Rapid fire. Like my bars. Many people compare them.',
    'Yeah! Okay! What! Those are ad-libs. I am doing the ad-libs. You keep shooting.',
    'That was a {damn} drive-by. Our drive-by. The good kind.',
    'Did you see that? Somebody put that in the video. Slow motion. Then normal motion. Then slow again.',
  ]),
  ...q('pickup', [
    'Gold record. On the water. Very wet record. Still counts.',
    'That is a certified gold record, captain. Hang it on the hull. Fix the hull with it. Both.',
    'A record in the water. Somebody is leaking the album. Pick it up. Investigate later.',
    'Free gold. I {damn} love free gold. Keep sailing, there is probably more.',
  ]),
  ...q('ciws', [
    'BRRRT. I like that noise. Put it on the beat. Put it everywhere.',
    'That little gun just spun up. Beautiful spin. The best spin. More of that.',
    'Did the boat just rap? That was a flow. Mechanical flow. Nobody has it.',
    'Close-in weapon. Very close. Too close for comfort. Comfort is for the {damn} opps.',
  ]),
  ...q('driveBy', [
    'That is a drive-by, captain. A real one. Ours was a metaphor.',
    'Hydraulics! On the beach! Who paid for the road? I want to know who paid for the {damn} road.',
    'They are bouncing the car at us. Bounce the boat back. We have hydraulics too. I think. Check.',
    'A lowrider with a crew in it. Red bandanas. Or blue. I cannot tell from the booth. Shoot both.',
    'Beautiful car. Twelve coats. Shame. Shoot it anyway, captain. I will buy another one.',
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
