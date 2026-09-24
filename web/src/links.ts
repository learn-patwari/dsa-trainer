/** Where to read more about a problem once you've answered its approach check. */
export interface StudyLink {
  label: string;
  href: string;
  note: string;
}

export function studyLinks(slug: string, title: string): StudyLink[] {
  const q = encodeURIComponent(title);
  return [
    {
      label: 'Editorial',
      href: `https://leetcode.com/problems/${slug}/editorial/`,
      note: "LeetCode's own write-up (premium for some problems)",
    },
    {
      label: 'Community solutions',
      href: `https://leetcode.com/problems/${slug}/solutions/`,
      note: 'Top-voted approaches and discussion',
    },
    {
      label: 'NeetCode video',
      href: `https://www.youtube.com/results?search_query=${encodeURIComponent(`NeetCode ${title}`)}`,
      note: 'Walk-through on YouTube',
    },
    {
      label: 'takeuforward',
      href: `https://takeuforward.org/?s=${q}`,
      note: "Striver's article, brute → better → optimal",
    },
  ];
}

export interface Portal {
  name: string;
  href: string;
  cost: 'Free' | 'Freemium' | 'Paid';
  what: string;
  /** Why it's worth opening alongside this app. */
  use: string;
}

/** The prep sites worth knowing, and what each one is actually good for. */
export const PORTALS: { group: string; items: Portal[] }[] = [
  {
    group: 'Curated lists — what to solve',
    items: [
      {
        name: "Striver's A2Z sheet (takeUforward)",
        href: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2',
        cost: 'Free',
        what: '~455 problems across 19 steps, from basics to advanced strings, with notes and video for each.',
        use: 'The long road. Use it when a pattern here is rated weak and you want volume plus a written explanation.',
      },
      {
        name: 'NeetCode 150 / roadmap',
        href: 'https://neetcode.io/roadmap',
        cost: 'Freemium',
        what: '150 problems in 18 categories, drawn on a dependency graph so you can see what comes before what.',
        use: 'The same coverage as this app’s bank. Its videos are the best second explanation when an approach doesn’t click.',
      },
      {
        name: 'Grind 75 (Tech Interview Handbook)',
        href: 'https://www.techinterviewhandbook.org/grind75/',
        cost: 'Free',
        what: 'Blind 75, rebuilt by its author so you can set weeks and hours per week and get a schedule.',
        use: 'Sanity-check the study plan here: at 8 hours a week, 75 problems takes about 8 weeks.',
      },
      {
        name: 'Sean Prashad’s Leetcode Patterns',
        href: 'https://seanprashad.com/leetcode-patterns/',
        cost: 'Free',
        what: '~180 problems tagged by pattern, filterable by company and difficulty.',
        use: 'Company filter, and a second opinion on which pattern a problem belongs to.',
      },
    ],
  },
  {
    group: 'Explanations — when you’re stuck',
    items: [
      {
        name: 'LeetCode editorials & solutions',
        href: 'https://leetcode.com/problemset/',
        cost: 'Freemium',
        what: 'The official write-up plus the community thread on every problem.',
        use: 'Read the top-voted solution after you attempt, never before. Linked on every result card here.',
      },
      {
        name: 'GeeksforGeeks',
        href: 'https://www.geeksforgeeks.org/dsa-tutorial-learn-data-structures-and-algorithms/',
        cost: 'Free',
        what: 'An article for nearly every algorithm, usually with several approaches side by side.',
        use: 'Best when you want the textbook version of a data structure rather than one problem’s trick.',
      },
      {
        name: 'VisuAlgo',
        href: 'https://visualgo.net/en',
        cost: 'Free',
        what: 'Animated data structures and algorithms — heaps, BSTs, Dijkstra, sorting.',
        use: 'When the structure itself is the problem, watch it move before writing code.',
      },
      {
        name: 'Big-O cheat sheet',
        href: 'https://www.bigocheatsheet.com/',
        cost: 'Free',
        what: 'Time and space for every common structure and sort, in one table.',
        use: 'The complexity questions here expect these by heart.',
      },
    ],
  },
  {
    group: 'Practice under pressure',
    items: [
      {
        name: 'interviewing.io',
        href: 'https://interviewing.io/',
        cost: 'Freemium',
        what: 'Anonymous mock interviews with engineers from big tech; a free AI interviewer for coding and system design.',
        use: 'Closest thing to the real round. Do a few before your first onsite.',
      },
      {
        name: 'Pramp (now Exponent Practice)',
        href: 'https://www.pramp.com/',
        cost: 'Freemium',
        what: 'Peer mock interviews — you interview someone, then they interview you.',
        use: 'Free reps at explaining out loud, which is the half this app can’t grade.',
      },
      {
        name: 'LeetCode contests',
        href: 'https://leetcode.com/contest/',
        cost: 'Free',
        what: 'Weekly and biweekly timed contests, four problems in 90 minutes.',
        use: 'Trains the one thing drilling can’t: picking the approach fast, with a clock running.',
      },
      {
        name: 'CSES Problem Set',
        href: 'https://cses.fi/problemset/',
        cost: 'Free',
        what: '300 classic algorithm problems, heavier on graphs and DP than interview lists.',
        use: 'Optional. Go here if DP or graphs still feel shaky after this app’s set.',
      },
    ],
  },
  {
    group: 'Beyond the coding round',
    items: [
      {
        name: 'Tech Interview Handbook',
        href: 'https://www.techinterviewhandbook.org/',
        cost: 'Free',
        what: 'The whole loop: resume, behavioural answers, negotiation, and a study plan by time left.',
        use: 'Read the behavioural and negotiation pages once — they move the offer more than one extra problem.',
      },
      {
        name: 'System Design Primer',
        href: 'https://github.com/donnemartin/system-design-primer',
        cost: 'Free',
        what: 'The standard open-source system design course, with flashcards.',
        use: 'Required for mid-level and above; this app deliberately covers only the algorithms round.',
      },
      {
        name: 'Anki',
        href: 'https://apps.ankiweb.net/',
        cost: 'Free',
        what: 'The spaced-repetition app the Review tab here is modelled on.',
        use: 'Only if you want cards for syntax and complexities too. Keep code off the back of the card — prompt the idea.',
      },
    ],
  },
];
