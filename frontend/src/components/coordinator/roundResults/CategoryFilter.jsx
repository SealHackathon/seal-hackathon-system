import { SquaresFour, Stack } from '@phosphor-icons/react'
import styles from './CategoryFilter.module.css'

// -- Lọc hạng mục, dùng CHUNG style pill bo tròn như Vòng thi. Chỉ "Tất cả" có icon --
// props: categories[{id,name}], currentCategoryId, onChange

function CategoryFilter({ categories, currentCategoryId, onChange }) {
  const items = [{ id: 'all', name: 'Tất cả hạng mục' }, ...categories]
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>
        <SquaresFour size={24} weight="bold" className={styles.labelIcon} />
        <span className={styles.labelText}>Hạng mục</span>
      </div>

      <div className={styles.track}>
        {items.map((cat) => {
          const selected = currentCategoryId === cat.id
          const isAll = cat.id === 'all'
          const cls = [styles.seg, selected ? styles.segSelected : styles.segIdle].join(' ')
          return (
            <button type="button" key={cat.id} className={cls} onClick={() => onChange(cat.id)}>
              {isAll && <Stack size={18} weight={selected ? 'fill' : 'regular'} className={styles.segIcon} />}
              <span className={styles.segName}>{cat.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryFilter