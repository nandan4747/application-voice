export const art = (key) => {
  //const artUrl = `https://picsum.photos/seed/${song.id}/400/400`;
  //const artUrl = `https://loremflickr.com/400/400/music,abstract?lock=${song.id}`;
  const larg = `https://picsum.photos/seed/${key}/400/400`;
  const medium = `https://picsum.photos/seed/${key}/200/200`;
  const mini = `https://picsum.photos/seed/${key}/50/50`;

  return {
    larg,
    mini,
    medium,
  };
};
