import { useMemo, useState } from 'react';
import { ResearchArea } from '../types';
import { Search, X, Check } from 'lucide-react';

interface Props {
  areas: ResearchArea[];
  selectedIds: string[];
  weights: Record<string, number>;
  onToggle: (areaId: string) => void;
  onWeightChange: (areaId: string, weight: number) => void;
}

export default function ResearchAreaSelector({ areas, selectedIds, weights, onToggle, onWeightChange }: Props) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const set = new Set<string>();
    areas.forEach((a) => a.category && set.add(a.category));
    return ['All', ...Array.from(set).sort()];
  }, [areas]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return areas.filter((a) => {
      const matchesQuery = !q || a.name.toLowerCase().includes(q) || (a.description ?? '').toLowerCase().includes(q);
      const matchesCat = activeCategory === 'All' || a.category === activeCategory;
      return matchesQuery && matchesCat;
    });
  }, [areas, query, activeCategory]);

  const selectedSet = new Set(selectedIds);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search research areas…"
            className="input pl-10"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {filtered.map((area) => {
          const isSelected = selectedSet.has(area.id);
          return (
            <div
              key={area.id}
              className={`rounded-xl border-2 p-3 transition-all duration-200 ${
                isSelected
                  ? 'border-primary-400 bg-primary-50/50 shadow-sm'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
              }`}
            >
              <label className="flex cursor-pointer items-start gap-3">
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-neutral-300 bg-white text-transparent hover:border-neutral-400'
                }`}>
                  <Check className="h-3 w-3" />
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(area.id)}
                    className="sr-only"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-800">{area.name}</span>
                    {area.category && (
                      <span className="badge bg-neutral-100 text-neutral-500">{area.category}</span>
                    )}
                  </div>
                  {area.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">{area.description}</p>
                  )}
                  {isSelected && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-xs font-medium text-neutral-500">Priority:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={(e) => { e.preventDefault(); onWeightChange(area.id, w); }}
                            className={`h-6 w-6 rounded-md text-xs font-bold transition-all duration-200 active:scale-90 ${
                              (weights[area.id] ?? 1) >= w
                                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm'
                                : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                            }`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-neutral-400">No research areas match your search.</p>
        )}
      </div>
    </div>
  );
}
