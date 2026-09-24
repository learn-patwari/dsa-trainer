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
