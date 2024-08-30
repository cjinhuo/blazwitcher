export function timeAgo(lastAccessed: number) {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - lastAccessed) / 1000);

  const timeMappings = [
    { threshold: 20, text: "just visited" },
    { threshold: 60, text: (diff: number) => `${diff} 秒前` },
    { threshold: 3600, text: (diff: number) => `${Math.floor(diff / 60)} minutes ago` },
    { threshold: 86400, text: (diff: number) => `${Math.floor(diff / 3600)} hours ago` },
    { threshold: 604800, text: (diff: number) => `${Math.floor(diff / 86400)} days ago` },
    { threshold: Infinity, text: (diff: number) => `${Math.floor(diff / 604800)} weeks ago` }
  ];

  for (const mapping of timeMappings) {
    if (diffInSeconds < mapping.threshold) {
      return typeof mapping.text === "function" ? mapping.text(diffInSeconds) : mapping.text;
    }
  }
}

// console.log(timeAgo(1725007196539.729)); 