'use strict';

// Editorial guidance for these prose exercises, not claims about the source traditions.
// Family-level guidance is labeled as such in the interface.
const TREATMENT_GUIDANCE = {
  'Act & Conflict Spines': {
    useful: 'A chapter needs a clear local change while still moving the larger story forward.',
    effect: 'The reader can follow a developing situation and recognize the turn that changes it.',
    caution: 'A neat outline can make a scene feel predetermined. Let the characters complicate each movement.'
  },
  'Tempo & Acceleration': {
    useful: 'The speed of events matters as much as what happens.',
    effect: 'Changing the space between developments makes the reader feel acceleration or release.',
    caution: 'Fast prose alone is not escalation. Each new beat needs to change the situation.'
  },
  'Loops, Refrain & Recurrence': {
    useful: 'An action, image, or encounter can return with a different meaning.',
    effect: 'Recognition creates anticipation; the variations make the reader notice what has changed.',
    caution: 'Repetition needs a new cost, detail, or implication each time.'
  },
  'Mirror, Retrograde & Re-enactment': {
    useful: 'Looking back at the same event or pattern can revise the reader’s first interpretation.',
    effect: 'The reader compares versions and reconstructs meaning rather than simply following events.',
    caution: 'Give clear anchors for time and viewpoint so deliberate uncertainty does not become disorientation.'
  },
  'Fractured & Drifting Time': {
    useful: 'Memory, association, or discovery is more important than a straight timeline.',
    effect: 'The reader experiences connections as they emerge in a character’s attention.',
    caution: 'Keep an emotional or sensory thread intact when time and setting change.'
  },
  'Braided & Polyphonic': {
    useful: 'Separate people or channels of information change how we understand one situation.',
    effect: 'The reader holds several perspectives in mind and notices their agreements and collisions.',
    caution: 'Make each voice contribute something the others cannot. Mark transitions clearly.'
  },
  'Argument, Law & Dialectic': {
    useful: 'A claim, accusation, or decision needs to be tested rather than simply announced.',
    effect: 'The reader weighs competing explanations and revises a judgment as evidence arrives.',
    caution: 'Keep something personal at stake so the scene does not become an abstract debate.'
  },
  'Code & Systems Logic': {
    useful: 'A repeated attempt, dependency, or hidden rule drives what can happen next.',
    effect: 'The reader learns the system and starts anticipating its failure points.',
    caution: 'Make the rule legible through consequences. Technical metaphors should not replace lived experience.'
  },
  'Mosaic, Collage & Montage': {
    useful: 'Fragments or sharply separated moments tell more together than any continuous scene could.',
    effect: 'The reader fills the gaps and discovers meaning in the placement of one fragment beside another.',
    caution: 'Give each fragment a purpose and a recognizable connection; arbitrary cuts dilute the effect.'
  },
  'Constraint & Frame-Breaking': {
    useful: 'The way a chapter is told should become part of its subject.',
    effect: 'The reader notices the form and may question the teller’s habits or authority.',
    caution: 'The constraint can crowd out the story. Keep a human want or changing relationship visible.'
  },
  'Non-Causal & Mood-Unified': {
    useful: 'A shared emotional atmosphere can connect moments that do not form a cause-and-effect chain.',
    effect: 'Images accumulate into a felt understanding rather than a single explanation.',
    caution: 'Mood still needs development. Let a recurring image acquire a new implication.'
  },
  'Ritual, Liturgy & Calendar': {
    useful: 'An invented ceremony, recurring hour, or prescribed sequence can organize change.',
    effect: 'An expected pattern makes departures from it feel significant.',
    caution: 'These are prose adaptations. Develop the story’s own context rather than treating a living tradition as a generic device.'
  },
  'Spatial & Cartographic': {
    useful: 'Moving through a place can also move through memories, choices, or discoveries.',
    effect: 'The reader builds a mental map whose locations acquire emotional meaning.',
    caution: 'Movement alone is not change. Make each location alter what the character knows or wants.'
  },
  'Military, Survival & Tension': {
    useful: 'Shrinking options, incomplete information, or competing duties constrain a decision.',
    effect: 'The reader tracks available choices and feels the cost of losing them.',
    caution: 'Clarify the practical stakes. Constant danger without a changed choice can become repetitive.'
  },
  'Emotional & Psychological Engines': {
    useful: 'The chapter’s central event is a change in how someone understands or tolerates a situation.',
    effect: 'The reader follows a shifting interpretation from inside the character’s experience.',
    caution: 'These are fictional exercises, not universal psychological stages. Ground changes in this particular character.'
  },
  'Dialogue & Verbal Combat': {
    useful: 'Speech is the action: each exchange changes leverage, intimacy, or permission.',
    effect: 'The reader listens for the difference between what is said and what it accomplishes.',
    caution: 'Avoid interchangeable clever lines. Give speakers different tactics and something to lose.'
  },
  'Chance, Game & Grids': {
    useful: 'An external pattern can force you to discover connections you would not ordinarily write.',
    effect: 'The reader encounters unexpected turns held together by a recurring organizing device.',
    caution: 'A random prompt is not a story justification. Make the resulting actions believable.'
  },
  'Tonal & Liminal': {
    useful: 'Crossing a threshold changes the rules a character has learned to rely on.',
    effect: 'The reader discovers a new normal alongside someone who must adapt to it.',
    caution: 'Keep one familiar want or detail so unfamiliar rules have a point of reference.'
  },
  'Experimental page adaptations': {
    useful: 'Language, omission, or competing versions should actively shape the reader’s understanding.',
    effect: 'The reader participates in reconstructing the chapter instead of receiving one settled account.',
    caution: 'Establish an intelligible pattern before disrupting it. The experiment still needs a meaningful change.'
  }
};

const STRUCTURE_GUIDANCE = {
  1: { useful: 'A new piece of context should transform ordinary details without requiring a confrontation.', effect: 'Familiar details suddenly connect in a different way.', caution: 'Plant details that earn the turn; an unrelated surprise will feel pasted on.' },
  4: { useful: 'You want a satisfying local story inside a larger unfinished one.', effect: 'The reader gets a small resolution and a sense of progress.', caution: 'Close the local question without accidentally resolving the whole book’s tension.' },
  5: { useful: 'A setback needs to produce a decision that launches the next chapter.', effect: 'Action has emotional consequences, and reflection becomes a new commitment.', caution: 'Let the reaction change the decision; do not merely recap the preceding action.' },
  7: { useful: 'The crisis is compelling but needs a small amount of earlier context.', effect: 'Immediate urgency becomes understanding, then renewed forward motion.', caution: 'Keep the backward step brief and move beyond the opening moment when you return.' },
  19: { useful: 'Returning to an opening image or action will reveal how much has changed.', effect: 'The ending feels connected to the beginning while revising its meaning.', caution: 'An echo needs a changed implication, not just the same sentence repeated.' },
  23: { useful: 'Several people remember the same event in incompatible ways.', effect: 'The reader becomes an interpreter of motives and discrepancies.', caution: 'Give each account a distinct stake and at least one detail the others cannot supply.' },
  29: { useful: 'Two threads can develop separately and illuminate one another at their crossings.', effect: 'The reader anticipates connections that the characters may not yet see.', caution: 'Switch at meaningful turns, and keep each thread intelligible on its own.' },
  50: { useful: 'Letters, messages, or records can reveal a relationship through omissions and contradictions.', effect: 'The reader assembles the story from evidence rather than an explanatory narrator.', caution: 'Make the documents plausible for their writers and recipients, not just convenient exposition.' }
};

const INFORMATION_ORDERS = [
  { id: 'blueprint', name: 'Keep blueprint order', guide: 'Follow the original sequence of beats; let the structure itself control when information arrives.' },
  { id: 'chronological', name: 'Cause → consequence', guide: 'Show the triggering event, the response, then the result. Let the reader anticipate what might happen.' },
  { id: 'aftermath', name: 'Consequence → cause', guide: 'Open on an outcome. Step back to the choice that caused it, then return with a changed understanding.' },
  { id: 'delayed', name: 'Delay the key context', guide: 'Show a legible action first. Reveal the missing context only when it changes the meaning of what we saw.' },
  { id: 'perspectives', name: 'One event, several views', guide: 'Return to the same event from another viewpoint; add a revealing discrepancy instead of repeating everything.' },
  { id: 'braid', name: 'Alternate two threads', guide: 'Switch between linked threads at meaningful turns. Make each switch create a question or answer one.' }
];

const CHAPTER_ENDINGS = [
  { id: 'decision', name: 'A decision', guide: 'Stop when a character commits to a choice whose consequences belong in the next chapter.' },
  { id: 'reversal', name: 'A reversal', guide: 'Let the final action change who has control, what is possible, or what the apparent victory costs.' },
  { id: 'revelation', name: 'A revelation', guide: 'End on a discovery that changes how the reader understands the chapter’s earlier details.' },
  { id: 'image', name: 'An unresolved image', guide: 'Leave one concrete image charged with a question or feeling. Do not explain away its resonance.' },
  { id: 'settling', name: 'Emotional settling', guide: 'Let the character absorb the change. Finish on a small action that shows what now feels different.' },
  { id: 'question', name: 'An open question', guide: 'Resolve enough of this scene to earn trust, then leave a specific consequential question unanswered.' }
];
