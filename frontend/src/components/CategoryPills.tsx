'use client';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🌾' },
  { id: 'fruits', label: 'Fruits', icon: '🍎' },
  { id: 'grains', label: 'Grains', icon: '🌾' },
  { id: 'herbs', label: 'Herbs', icon: '🌿' },
  { id: 'veg', label: 'Vegetables', icon: '🥕' },
];

interface CategoryPillsProps {
  activeCategory?: string;
  onSelectCategory?: (id: string) => void;
}

export default function CategoryPills({ activeCategory = 'all', onSelectCategory }: CategoryPillsProps) {
  return (
    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory?.(category.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
            activeCategory === category.id
              ? 'bg-primary-light border border-primary text-primary font-medium shadow-sm'
              : 'bg-background border border-border text-muted hover:bg-border'
          }`}
        >
          <span className="text-lg">{category.icon}</span>
          <span className="text-sm">{category.label}</span>
        </button>
      ))}
    </div>
  );
}
