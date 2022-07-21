export const getUniqueColor = (string: string, colorSet: string[]): string => {
  const getNumericHash = (string: string) => {
    let hash = 0;
    if (string.length === 0) return hash;
    for (let i = 0; i < string.length; i++) {
      const char = string.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  };
  const modulo = colorSet.length;
  const colorIndex = ((getNumericHash(string) % modulo) + modulo) % modulo;
  return colorSet[colorIndex];
};

export const getInitials = (name: string): RegExpMatchArray => {
  return name.match(/\b\w/g) || [];
};
