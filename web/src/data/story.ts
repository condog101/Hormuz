// The plot, told in Big Don's posts between tracks: 2Pac is alive, held on Qeshm by MINISTRY RECORDS
// (the Ayatollah's label), and Big Don is going in. Every post and reply is fictional satire in the
// cadence of a 3 AM tweet, not a real post (the one exception, card b on T1, is Connor's own line).
// Guest replies are caricatures, not quotes. Swear words are {word} and render bleeped, as in quotes.ts.
// Tweets stay at or under 220 characters and replies at or under 120 (tests/quotes.test.ts).

import type { GuestKey } from './quotes';

/** Copy that differs by input scheme; resolved with byInput() at display time. */
export type InputText = string | { desktop: string; touch: string };

export interface Tweet {
  /** Don's post; {word} bleeps as in quotes.ts. */
  text: InputText;
  /** Gag footer under the post. */
  stats?: string;
  /** One dry line back from a rapper. */
  reply?: { who: GuestKey; text: string };
}

/** Briefing cards shown before each campaign track (none for hidden tracks). */
export const TWEETS: Record<number, Tweet[]> = {
  1: [
    {
      text: "BREAKING: PAC IS ALIVE. My nephew saw him buying iced tea at a petrol station on Qeshm. MINISTRY RECORDS, the Ayatollah's label, has had him in a studio since '96. We are going in. JUST WATCH!",
      stats: 'REPOSTS 0   LIKES 1 (BIG DON)',
    },
    {
      text: "Open the {fuckin'} Strait, you crazy bastards, or you'll be living in Hell - JUST WATCH! Thank you for your attention to this matter!",
      stats: 'REPOSTS 12K   COMMUNITY NOTE PENDING',
    },
    {
      text: {
        desktop: 'Captain! The boat is EASY. W A S D to move. Point the MOUSE to aim the big gun. CLICK or SPACE to fire. SHIFT for flank speed, very fast, very beautiful. Even a child could do it. Not my children. Too busy.',
        touch: 'Captain! The boat is EASY. Hold the ARROWS bottom left to move. TOUCH THE WATER where you want to shoot and keep your finger down to fire. FLANK button for speed. Even a child could do it. Not my children. Too busy.',
      },
      stats: 'REPOSTS 3   LIKES 4',
    },
    {
      text: {
        desktop: 'More weapons. The best. E fires the CIWS, little gun, kills missiles and shells. R or MIDDLE CLICK fires DISS TRACKS: three guided missiles, they find the nearest three opps. 12 second reload. TAB switches guns.',
        touch: 'More weapons. The best. Tap CIWS for the little gun, shoots down missiles and shells. Tap DISS for DISS TRACKS: three guided missiles, they find the nearest three opps. 12 second reload. GUN switches main guns.',
      },
      stats: 'REPOSTS 7   LIKES 9',
      reply: { who: 'cube', text: '@BigDon the captain did not sign up for this.' },
    },
  ],
  2: [
    {
      text: 'They put a ROAD on the beach. Lowriders. Bouncing. They pull up next to my boat and spray. Classic drive-by. THEIRS, not ours. Shoot the cars, captain. Nobody drives by Big Don!',
      stats: 'REPOSTS 41   LIKES 88',
      reply: { who: 'snoop', text: '@BigDon them hydraulics cost more than your boat, nephew.' },
    },
  ],
  3: [
    {
      text: 'From this track on there is a GOLDEN MIC floating in the strait. Grab it and a famous friend jumps on the track. Buffs! All my friends are famous. All of them. Biggest guest list in history!',
      stats: 'REPOSTS 230   LIKES 1.1K',
      reply: { who: 'dre', text: '@BigDon we are not friends.' },
    },
  ],
  4: [
    {
      text: 'Pac, if you are reading this, HOLD ON. We are at Hormuz Island. Mines in the water, shoot them before they hit the hull. Pac, blink twice if MINISTRY RECORDS is making you drink the iced tea.',
      stats: 'REPOSTS 3.2K   LIKES 9K',
      reply: { who: 'pac', text: '@BigDon stop tweeting about me. they read the tweets. they have wifi.' },
    },
  ],
  5: [
    {
      text: "Big news. The Ayatollah's MOTHERSHIP is waiting at the end of THE NARROWS. Both crews on deck. Pac is on it. Probably. Sink it carefully. Not too carefully. Drones overhead too. Bad drones!",
      stats: 'REPOSTS 18K   LIKES 40K',
      reply: { who: 'pac', text: '@BigDon I am not on the boat.' },
    },
  ],
  6: [
    {
      text: 'Musandam Cliffs. Cliffs on both sides. Incredible acoustics. I want to record the rescue here. Live album. Captain, do not hit the cliffs. Very expensive cliffs. Probably.',
      stats: 'REPOSTS 900   LIKES 2K',
      reply: { who: 'dre', text: '@BigDon the acoustics are fine. the boat is the problem.' },
    },
  ],
  7: [
    {
      text: {
        desktop: 'MISSILE ALLEY. They have missiles now. When the klaxon goes, hit E for the CIWS or press R to DISS the launchers. Missiles do not care about your flow. Very rude missiles!',
        touch: 'MISSILE ALLEY. They have missiles now. When the klaxon goes, tap CIWS, or tap DISS and hit the launchers. Missiles do not care about your flow. Very rude missiles!',
      },
      stats: 'REPOSTS 5K   LIKES 12K',
      reply: { who: 'cube', text: '@BigDon or just move the boat.' },
    },
  ],
  8: [
    {
      text: 'We have reached G.O.A.T. ISLAND. Named after me. The goats disagree. FAKE GOATS. Everything they have, all at once. Pac is close. I can feel it. My nephew can feel it too.',
      stats: 'REPOSTS 7K   LIKES 20K',
      reply: { who: 'snoop', text: '@BigDon the goats got a point.' },
    },
  ],
  9: [
    {
      text: "UPDATE: Pac says the album is DONE. Twenty-nine years. He says it is about me. Can't wait! Tremendous honour. Hearing it is 'not nice'. FAKE NEWS. It is very nice. The nicest!",
      stats: 'REPOSTS 31K   LIKES 77K',
      reply: { who: 'pac', text: '@BigDon track 7 is called Big Don Is Not Coming. you are coming. it is a problem.' },
    },
  ],
  10: [
    {
      text: 'FINAL TRACK. MINISTRY RECORDS put Pac on a PRISON BARGE at the end of the strait. 100%. My nephew confirmed. Sink the barge, carefully, and Pac is FREE. Biggest rescue in history. JUST WATCH!',
      stats: 'REPOSTS 120K   LIKES 300K   NEPHEW 1',
      reply: { who: 'pac', text: '@BigDon still not on the boat.' },
    },
  ],
};

/** Shown after track 10, before the victory screen. */
export const ENDING: Tweet[] = [
  {
    text: 'Statement from 2Pac (posted by Big Don, he asked me to, very nicely): I was never kidnapped. I live here. I have a villa. The iced tea is great. I was finishing an album. It is finished now. Please go home.',
    stats: 'REPOSTS 2M   LIKES 5M',
  },
  {
    text: 'RESCUED! Pac is FREE. Biggest rescue in history. Many people said it could not be done. I did it. With some help. Small help. The captain. Great captain!',
    stats: 'REPOSTS 900K   LIKES 1.2M',
    reply: { who: 'pac', text: '@BigDon I am still in Qeshm.' },
  },
  {
    text: 'FAKE NEWS. Pac is on the boat. I have seen the boat. Beautiful boat. Album drops Friday. Thank you for your attention to this matter!',
    stats: 'REPOSTS 3M   LIKES 7M   COMMUNITY NOTE ADDED',
    reply: { who: 'snoop', text: '@BigDon he sent me a pic from the pool just now, nephew.' },
  },
];

/** In-game story beats: a guest calls in mid-track (or at the boss) and Big Don answers. */
export interface Beat {
  level: number;
  /** Fraction of the track's distance, or 'boss' to replace the boss intro line. */
  at: number | 'boss';
  guest: GuestKey;
  line: string;
  don: string;
}

export const BEATS: Beat[] = [
  {
    level: 4,
    at: 0.5,
    guest: 'pac',
    line: "(muffled) Captain? It's Pac. I'm in the bathroom. Don't tell Don I called. Everything is fine. Turn around.",
    don: 'PAC CALLED! From a BATHROOM! They will not even let him use the studio phone. Disgraceful. KEEP GOING!',
  },
  {
    level: 5,
    at: 'boss',
    guest: 'pac',
    line: "I am not on that boat. Hit it anyway, Don's watching.",
    don: 'That is a HOSTAGE MESSAGE. Pac is DEFINITELY on that boat. Sink it gently. Very gently. Hard!',
  },
  {
    level: 8,
    at: 0.4,
    guest: 'snoop',
    line: 'Ayy captain. Talked to Pac. He says the villa has a pool now. Just so you know. Carry on, nephew.',
    don: 'A POOL. They are torturing him with a POOL. Inhumane. Faster, captain. JUST WATCH!',
  },
  {
    level: 10,
    at: 'boss',
    guest: 'pac',
    line: "Don, that barge is empty. I'm at home. I can see you on TV. Nice boat, captain.",
    don: 'He says the barge is empty. That is EXACTLY what a prisoner would say. Sink it! Thank you for your attention!',
  },
];
