import { MagnifyingGlass } from '@phosphor-icons/react'
import FilterTabs from './FilterTabs'
import SortBar from './SortBar'
import FormInput from '../FormInput'
import styles from './SearchFilterBar.module.css'

/**
 * SearchFilterBar — Search + Filter + Sort gộp lại
 *
 * @param {string}   searchValue
 * @param {function} onSearchChange        — (value) => void
 * @param {string}   [searchPlaceholder]
 *
 * @param {Array}    filters               — truyền vào FilterTabs
 * @param {object}   countByKey            — truyền vào FilterTabs
 * @param {string}   activeFilter
 * @param {function} onFilterChange        — (key) => void
 *
 * @param {Array}    sortOptions           — truyền vào SortBar
 * @param {string}   activeSort
 * @param {function} onSortChange          — (key) => void
 * @param {string}   [sortLabel]
 */
function SearchFilterBar({
  searchValue, onSearchChange, searchPlaceholder = 'Tìm kiếm...',
  filters, countByKey, activeFilter, onFilterChange,
  sortOptions, activeSort, onSortChange, sortLabel,
}) {
  return (
    <div className={styles.wrapper}>
      {/* Search input */}
      <div className={styles.searchWrapper}>
        <FormInput
          iconLeft={MagnifyingGlass}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={e => onSearchChange?.(e.target.value)}
        />
      </div>

      {/* Filter tabs */}
      {filters && (
        <FilterTabs
          filters={filters}
          countByKey={countByKey}
          activeKey={activeFilter}
          onChange={onFilterChange}
        />
      )}

      {/* Sort bar */}
      {sortOptions && (
        <SortBar
          options={sortOptions}
          activeKey={activeSort}
          onChange={onSortChange}
          label={sortLabel}
        />
      )}
    </div>
  )
}

export default SearchFilterBar