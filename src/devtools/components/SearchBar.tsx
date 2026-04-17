import { useAppStore } from '@shared/store';
import { debounce } from '@shared/utils';
import { useCallback } from 'react';

function SearchBar() {
  const { searchQuery, setSearchQuery } = useAppStore();

  const handleChange = useCallback(
    debounce((value: unknown) => {
      setSearchQuery(String(value));
    }, 200),
    [setSearchQuery],
  );

  return (
    <input
      type="search"
      placeholder="Search by key, value, or domain…"
      defaultValue={searchQuery}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-600 rounded focus:outline-none focus:border-monster-500 text-slate-200 placeholder-slate-500"
    />
  );
}

export default SearchBar;
