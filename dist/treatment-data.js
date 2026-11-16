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
    useful: 'Separate people or channels of information change how the reader understands one situation.',
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
  { id: 'delayed', name: 'Delay the key context', guide: 'Show a legible action first. Reveal the missing context only when it changes the meaning of what the reader saw.' },
  { id: 'perspectives', name: 'One event, several views', guide: 'Return to the same event from another viewpoint; add a revealing discrepancy instead of repeating everything.' },
  { id: 'braid', name: 'Alternate two threads', guide: 'Switch between linked threads at meaningful turns. Make each switch create a question or answer one.' }
];

// The only ending catalog. The exercise, the three treatments, and the plan all read this list.
const ENDINGS = [
  { id: 'decision', name: 'A decision', category: 'Choice', level: 'grounded', description: 'Stop when someone commits to a choice whose consequences belong in the next scene.', example: 'She set the spare key on the counter, not in his hand. “I’ll go tonight,” she said. “Don’t wait up, and don’t follow.”', task: 'End on the sentence where someone chooses. Don’t show the outcome. Make the choice specific enough that the next scene has a job.' },
  { id: 'button', name: 'A button line', category: 'Choice', level: 'grounded', description: 'After the action, one short line lands the scene’s new terms, and then you stop.', example: 'He signed the form, slid it back, and said, “Now it’s your house.”', task: 'Add one line of dialogue or thought that names what is now true. Stop there. Don’t write the aftermath.' },
  { id: 'arrival', name: 'Someone arrives', category: 'Choice', level: 'grounded', description: 'The person or thing the scene has been moving toward shows up. Stop on the arrival.', example: 'They heard the stair. The third step always complained. It complained now, and nobody in the kitchen had stood.', task: 'Spend the scene preparing for an arrival. End on the first sign that it has happened. Don’t start the conversation.' },
  { id: 'refusal', name: 'A refusal', category: 'Choice', level: 'grounded', description: 'Someone says no, and for this scene the no is final.', example: '“Take the money,” he said. She folded the envelope once and pushed it back across the wet table. “No.”', task: 'Offer the thing the scene has been circling. End on a refusal that closes the offer. Don’t add a maybe.' },
  { id: 'handoff', name: 'A handoff', category: 'Choice', level: 'exploratory', description: 'The scene’s burden passes to someone else. You stay long enough to see the transfer.', example: 'She put the flashlight in his hand and closed his fingers around it. “Your turn to watch the road.” She was asleep before the next truck passed.', task: 'End when responsibility changes hands. Use an object to make the handoff physical. The next scene belongs to the person who received it.' },
  { id: 'debt', name: 'A debt', category: 'Choice', level: 'exploratory', description: 'Someone takes on an obligation that will come due later. End when both people know it.', example: '“I’ll get you out,” she said. He nodded, and the nod was a bill she would have to pay.', task: 'End on a promise or a favor that is too large for the moment. Show that both sides heard it. Don’t schedule the repayment.' },
  { id: 'reversal', name: 'A reversal', category: 'Turn', level: 'grounded', description: 'The last action changes who has control, what is possible, or what the win costs.', example: 'He got the gate open. Then he saw the padlock in his brother’s hand, and the open gate didn’t matter.', task: 'Give the result you led the reader to expect, then one physical action that flips who holds it.' },
  { id: 'revelation', name: 'A revelation', category: 'Turn', level: 'grounded', description: 'End on a discovery that changes how the earlier details read.', example: 'The receipt in the dryer was from a town she had never named. The date was the week he said he was home.', task: 'Plant two ordinary details earlier. End when a third detail makes them mean something else. Don’t explain the new meaning.' },
  { id: 'cost', name: 'The cost on the table', category: 'Turn', level: 'grounded', description: 'The character gets what they came for. The ending puts the price where you can see it.', example: 'She had the signed lease. She also had her sister’s page torn out of the address book.', task: 'Let them succeed. End on the object, body, or absence that the success cost. Don’t argue that it was worth it.' },
  { id: 'deadline', name: 'Time runs out', category: 'Turn', level: 'grounded', description: 'A clock the scene set reaches zero while you are still watching.', example: 'The hearing door opened. She was still on the stairs, one shoe in her hand, when the clerk began the names.', task: 'Name a deadline early. End when it hits, with the character short of what they needed. Show the time through an event, not an announcement.' },
  { id: 'echo', name: 'The opening, returned', category: 'Turn', level: 'exploratory', description: 'Come back to an image or action from the start, and let it mean something new.', example: 'She checked the bolt again. At dusk she had been locking the street out. The bolt was the same. Now she was checking whether it would hold her in.', task: 'Repeat a gesture from your first paragraph. Change who it protects, or what it is for. Don’t announce the echo.' },
  { id: 'misread', name: 'The misread', category: 'Turn', level: 'exploratory', description: 'The last beat shows that the obvious reading of the scene was wrong.', example: 'He had spent the hour comforting her. Then he saw the second ticket in her coat, and the comfort had been an audience.', task: 'Let the reader settle into one interpretation. End with a detail that makes that reading impossible. Skip “then he realized.”' },
  { id: 'parallel', name: 'The same action, elsewhere', category: 'Turn', level: 'exploratory', description: 'End on someone else doing the scene’s action in a different place.', example: 'Across town, her brother also locked a back door. He tested it twice. He did not know she had done the same thing a minute earlier.', task: 'Close the scene, then add a short final move that mirrors it somewhere else. The match should raise a question, not state a theme.' },
  { id: 'quiet', name: 'A quiet reversal', category: 'Turn', level: 'exploratory', description: 'A small social fact flips: who sits, who pours, who is allowed to leave.', example: 'All evening he had poured the coffee. She turned his cup over in its saucer and poured her own. He put his hands in his lap.', task: 'Pick a tiny habit of status. Reverse it in the last paragraph. No speeches. Let the other person adjust their body.' },
  { id: 'wrongtone', name: 'The wrong reaction', category: 'Turn', level: 'exploratory', description: 'End on a response that does not match the news.', example: 'The letter said the house was gone. She laughed once, the small laugh she used for jokes, and folded the page into a square.', task: 'After the news, give a reaction from the wrong drawer: a laugh, a courtesy, a chore. Don’t interpret it.' },
  { id: 'image', name: 'An unresolved image', category: 'Open door', level: 'grounded', description: 'Leave one concrete image charged with a question or a feeling. Don’t explain it.', example: 'The porch light stayed on. His coat was on the chair, and the sleeves were wet to the elbow.', task: 'Cut on a picture the reader can see. No summary sentence after it. The image should be hard to read as neutral.' },
  { id: 'settling', name: 'Emotional settling', category: 'Open door', level: 'grounded', description: 'Let the character absorb the change. Finish on a small action that shows what now feels different.', example: 'She washed the one cup, dried it, and set it facedown. The other three stayed in the rack.', task: 'After the turn, give the character one ordinary task. Let the way they do it show the new feeling. Don’t name the feeling.' },
  { id: 'question', name: 'An open question', category: 'Open door', level: 'grounded', description: 'Settle enough of the scene to earn trust, then leave one specific question unanswered.', example: 'They had the route, the cash, and a time. Neither of them would say who had given the address.', task: 'Answer the scene’s local problem. End on one concrete unknown that will matter later. Make it a fact, not a mood.' },
  { id: 'cliff', name: 'Cut at the worst moment', category: 'Open door', level: 'grounded', description: 'Stop in the middle of an action, when the outcome is about to happen and hasn’t.', example: 'The rope went tight. She had one hand on the rail and one on the knot, and the knot was slipping.', task: 'End one beat before success or failure. The last sentence is an action in progress, not a reaction to a finished one.' },
  { id: 'threshold', name: 'Over the threshold', category: 'Open door', level: 'exploratory', description: 'They cross into a place with different rules. Stop once they are on the other side, before they understand it.', example: 'The hallway carpet ended. Past it the floor was tile, and the air smelled like metal and soap. She stepped over the seam.', task: 'Mark a literal boundary. End one step past it. Don’t explain the new rules yet.' },
  { id: 'withheld', name: 'Almost said', category: 'Open door', level: 'exploratory', description: 'The important sentence starts and does not get finished.', example: '“Your father didn’t leave,” the neighbor said. She looked at the car. “He—” A bus covered the rest, and the neighbor did not repeat it.', task: 'Let someone begin the line the scene has earned. Cut before the name or the noun. The interruption should be physical.' },
  { id: 'falsecalm', name: 'False calm', category: 'Open door', level: 'exploratory', description: 'The surface settles. One detail stays wrong.', example: 'The argument was over. The chairs were pushed in. His keys were on the hook, and his shoes were not by the door.', task: 'Give the scene a tidy ending, then leave one concrete thing out of place. Don’t add a sentence that says something is wrong.' },
  { id: 'object', name: 'The charged object', category: 'Open door', level: 'exploratory', description: 'End on an object that means something it did not mean at the start.', example: 'She set the child’s shoe on the top step, where the morning light would find it. At noon it had been evidence. Now it was a message.', task: 'Use an object that first appeared as a plain fact. End with someone placing it, hiding it, or refusing to touch it. The new meaning comes from the action.' },
  { id: 'shortconfess', name: 'Confession, cut short', category: 'Open door', level: 'exploratory', description: 'The truth starts. The scene ends before it is complete.', example: '“I took it,” he said. “I took it on Tuesday, and I gave it to—” The phone rang in his pocket. He looked at her and did not answer.', task: 'Let the confession reach the verb and one detail. Interrupt before the name or the reason. Don’t use the interruption as comfort.' },
  { id: 'unreliable', name: 'The last line denies the scene', category: 'Frame', level: 'wild', description: 'The final sentence cancels something the scene just put on the page.', example: 'She watched him leave and counted his steps to the car. She would later say she had been asleep and had seen none of it.', task: 'Write a last sentence in which the teller cancels a fact you showed. Don’t decide which version is true.' },
  { id: 'gap', name: 'The result left out', category: 'Frame', level: 'wild', description: 'Stop before the result the scene seemed to promise. The missing piece is the ending.', example: 'The verdict was next. The scene ends while the clerk is still pouring water.', task: 'Set up a result the reader can name. End before it arrives, on an ordinary action. Don’t wink about the omission.' },
  { id: 'record', name: 'A record that rewrites it', category: 'Frame', level: 'wild', description: 'End with a label, list, log, or caption that changes what the scene was.', example: 'Incident report, line 12: “Visitor stated she was the owner’s daughter.” The signature under it was her mother’s.', task: 'After the scene, add a short document a stranger could have written. One line of it should make the reader’s version incomplete.' },
  { id: 'second', name: 'A second ending', category: 'Frame', level: 'wild', description: 'Give the scene the stop it wants, then one more beat that undoes the comfort.', example: 'They shook hands. It was done. On the way to the car he wrote the other buyer and said the handshake had been for show.', task: 'Write the ending the scene seems to want. Add two or three sentences that show it was performed. Stop before the consequences start.' },
  { id: 'outward', name: 'Spoken to the reader', category: 'Frame', level: 'wild', description: 'The last move speaks to someone outside the scene, and the frame breaks.', example: 'You can stop here if you want them happy. They weren’t. The porch light went out and stayed out.', task: 'For the last two sentences, speak outward and take back an easy comfort. Then give one concrete image so the scene still has a floor.' },
  { id: 'loop', name: 'The last line could be the first', category: 'Frame', level: 'wild', description: 'The ending repeats a line that could have opened the scene. The person saying it has changed.', example: '“Check it twice.” She said it to the empty kitchen. The first time she heard that sentence, she was the one being told.', task: 'Put a sentence that could open the scene at the end. Give it to someone who now knows what it costs. Don’t explain the loop.' },
  { id: 'erasure', name: 'An erasure', category: 'Frame', level: 'wild', description: 'The ending removes a detail the scene treated as solid.', example: 'She turned to tell him she was sorry. The chair was there. The dent in the cushion was gone.', task: 'Make the reader rely on one physical fact. In the last paragraph, remove it. Don’t replace it with an explanation.' },
  { id: 'split', name: 'Two endings', category: 'Frame', level: 'wild', description: 'Two final versions sit side by side, and both cannot be true.', example: 'In one telling, he caught her wrist and she stayed. In the other, he caught air and the door hit the wall. The bruise was on his wrist either way.', task: 'Write two endings of a few lines each. They must conflict. Share one physical detail so they feel like versions of one moment.' }
];
