// Original parody lines for the Commander-in-Chief popups. Every line here is
// fictional and written for this game; none are real quotes.

export type QuoteTag = 'random' | 'start' | 'damage' | 'boss' | 'death' | 'clear' | 'victory';

export interface Quote {
  text: string;
  tags: QuoteTag[];
}

export const QUOTES: Quote[] = [
  // random
  { tags: ['random'], text: 'Captain, this is the most beautiful strait. People are calling it the straightest strait ever. Not straight. Strait. Big difference.' },
  { tags: ['random'], text: 'Quick question. Can the ship go faster if we paint it gold? Somebody look into that. Very quietly.' },
  { tags: ['random'], text: 'I just want to say, nobody has ever sailed a boat as well as I would sail this boat. Nobody. Keep going.' },
  { tags: ['random'], text: 'Is the water wet over there? Our water is wetter. Tremendous water. Ask anyone.' },
  { tags: ['random'], text: 'I have a meeting in five minutes so please do the winning part now. Thank you.' },
  { tags: ['random'], text: 'They tell me the big gun is five inches. Five. I said make it six. They said that is not how it works. Sad!' },
  { tags: ['random'], text: 'Can you put me on speaker for the crew? Hello crew. You are doing a job. Thank you for the job.' },
  { tags: ['random'], text: 'Somebody told me oil comes through there. Lots of oil. Make sure it comes out the other side. Very important.' },
  { tags: ['random'], text: 'I am looking at the map right now. Very small strait. On my map it is the size of a thumb. Easy.' },
  { tags: ['random'], text: 'Have you tried simply going around? There is a lot of ocean. I have seen it. It is mostly ocean.' },
  { tags: ['random'], text: 'Many sailors come up to me with tears in their eyes and say sir, sir, the boat floats. And I say I know.' },
  { tags: ['random'], text: 'We are going to rename it the Strait of Winning. Maybe. I like Hormuz too. It has a ring.' },
  { tags: ['random'], text: 'Just checking in. I am watching on four televisions. You look bigger on the big one. Good.' },
  { tags: ['random'], text: 'Does the boat have a gift shop? It should have a gift shop. Hats. Very good hats.' },
  { tags: ['random'], text: 'Tell the admirals I said hello. Not that one. The other one. You know the one.' },
  { tags: ['random'], text: 'Ratings are through the roof on this transit. Maybe the highest rated strait in history.' },
  { tags: ['random'], text: 'Remember, the little boats are little. Ours is big. That is called strategy.' },
  { tags: ['random'], text: 'I was going to be an admiral. I would have been the best. I chose this instead. Sacrifice.' },
  // level start
  { tags: ['start'], text: 'Okay, here is the plan. Go through the strait. Do not hit anything bad. That is the whole plan. Beautiful plan.' },
  { tags: ['start'], text: 'New day, new strait. Actually the same strait. Further along. Keep going that way. East. Right side of the map.' },
  { tags: ['start'], text: 'Very important mission. Maybe the most important mission. I say that every time but this time I mean it.' },
  { tags: ['start'], text: 'I have spoken to the strait personally. It respects us. Mostly. Go.' },
  { tags: ['start'], text: 'Remember the three rules. Shoot the boats. Avoid the shells. Call me with good news only.' },
  // damage
  { tags: ['damage'], text: 'Was that us? That looked like us. Make it not be us next time.' },
  { tags: ['damage'], text: 'That is fake damage. The ship is fine. Tremendous condition. Is it on fire? Do not answer.' },
  { tags: ['damage'], text: 'Nobody told me the beach could shoot back. Somebody should have told me that.' },
  { tags: ['damage'], text: 'Ouch. I felt that and I am very far away in a very nice room.' },
  { tags: ['damage'], text: 'The paint job, captain. Think about the paint job. That was expensive paint.' },
  { tags: ['damage'], text: 'Dodge! You know dodging? Left and right. Up and down. You can do it. I believe in you. Somewhat.' },
  // boss
  { tags: ['boss'], text: 'You sank the big one! I am taking full credit for this. You can have some credit. Small credit.' },
  { tags: ['boss'], text: 'Mothership down. I called it. I call everything. Write that down.' },
  { tags: ['boss'], text: 'That boat was a loser boat. Very sad boat. Our boat is a winner boat. Simple.' },
  // death
  { tags: ['death'], text: 'We will get a new one. We have many. They are very expensive but we have many.' },
  { tags: ['death'], text: 'That one was defective. Somebody else built it. Get the next ship out there.' },
  { tags: ['death'], text: 'Bad luck. Total bad luck. Not your fault. Well, a little your fault. Try again.' },
  // level clear
  { tags: ['clear'], text: 'Another one! We do not even have to count anymore. Okay, count. I like counting.' },
  { tags: ['clear'], text: 'Perfect transit. Absolutely perfect. I am told there were some holes. Perfect holes.' },
  { tags: ['clear'], text: 'Phenomenal job. I will mention you in a speech. Not by name. But in spirit.' },
  // victory
  { tags: ['victory'], text: 'You did it! Open water! I always knew. I told everybody. Some people doubted. Not me. Never me.' },
  { tags: ['victory'], text: 'Mission accomplished. Big banner. Huge banner. The biggest banner. Order the banner.' },
];

export function pickQuote(tag: QuoteTag, recent: string[]): Quote {
  let pool = QUOTES.filter((q) => q.tags.includes(tag) && !recent.includes(q.text));
  if (pool.length === 0) pool = QUOTES.filter((q) => q.tags.includes(tag));
  return pool[Math.floor(Math.random() * pool.length)];
}
