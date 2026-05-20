export const getProductFallbackImage = (name: string, category: string): string => {
  const lowerName = (name || '').toLowerCase();
  if (lowerName.includes('tomato') || lowerName.includes('tommato')) return '/images/tomatoes.png';
  if (lowerName.includes('milk') || lowerName.includes('dairy') || category === 'dairy') return '/images/milk.png';
  if (lowerName.includes('pomegranate') || lowerName.includes('apple') || category === 'fruits') return '/images/pomegranate.png';
  if (lowerName.includes('tulsi') || lowerName.includes('basil') || category === 'herbs') return '/images/tulsi.png';
  if (lowerName.includes('berry') || lowerName.includes('berries')) return '/images/berries.png';
  
  if (category === 'vegetables') return '/images/tomatoes.png';
  return '/images/berries.png'; // Ultimate fallback
};
