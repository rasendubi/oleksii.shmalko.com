const pageSymbol = (type: string | null | undefined): string | null => {
  if (!type) return null;
  if (type === 'biblio') return '📖';
  if (type === 'post') return '🖋';
  if (type === 'hello') return '👋';
  return '📝';
};

export default pageSymbol;
