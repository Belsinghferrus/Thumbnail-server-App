const categoryPriority = [
  "Comedy",
  "Education",
  "Entertainment",
  "Science & Tech",
  "Film & Animation",
  "Gaming",
  "Howto & Style",
  "Music",
  "News & Politics",
  "Nonprofits",
  "People & Blogs",
  "Pets & Animals",
  "Sports",
  "Travel & Events",
];

const sortThumbnail = (thumbnails, users) => {
  let remaining = [...thumbnails];
  let sorted = [];

  while (remaining.length > 0) {
    let addedInThisRound = false;

    for (const category of categoryPriority) {
      let found = null;

      for (const user of users) {
        const candidates = remaining.filter(
          (thumb) => thumb.category === category && thumb.user._id.toString() === user._id.toString()
        );

        if (candidates.length > 0) {
          // Sort by newest first (descending createdAt)
          candidates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          found = candidates[0];
          break;
        }
      }

      if (found) {
        sorted.push(found);
        remaining = remaining.filter((thumb) => thumb._id.toString() !== found._id.toString());
        addedInThisRound = true;
      }
    }

    if (!addedInThisRound) break; // Prevent infinite loop
  }

  return sorted;
};

export default sortThumbnail