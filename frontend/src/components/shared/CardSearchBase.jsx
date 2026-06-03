import { MagnifyingGlass, CaretLeft, CaretRight } from '@phosphor-icons/react'
import Button from '../shared/Button'
import styles from './CardSearchBase.module.css'

function getPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const items = []
  const delta = 1 // số trang hiện thêm mỗi bên của currentPage

  const rangeStart = Math.max(2, currentPage - delta)
  const rangeEnd = Math.min(totalPages - 1, currentPage + delta)

  // Luôn có trang đầu
  items.push(1)

  if (rangeStart > 2) items.push('...')

  for (let i = rangeStart; i <= rangeEnd; i++) {
    items.push(i)
  }

  if (rangeEnd < totalPages - 1) items.push('...')

  items.push(totalPages)

  return items
}

function CardSearchBase({
  items,
  renderCard,
  searchPlaceholder,
  search, onSearchChange,
  fptOnly, onFptChange,
  currentPage, totalPages, onPageChange,
}) {
  return (
    <>
      <div className={styles.searchBar}>
        <input
          className={styles.searchInput}
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <MagnifyingGlass size={20} color="var(--color-primary-blue)" />
      </div>

      <label className={styles.filter}>
        <span>Lọc theo</span>
        <input
          type="checkbox"
          checked={fptOnly}
          onChange={(e) => onFptChange(e.target.checked)}
        />
        <span>Sinh viên Đại học FPT HCMC</span>
      </label>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2em',
          justifyContent: 'center'
        }}>
        {items.map(item => renderCard(item))}
      </div>

      <div className={styles.pagination}>
        <Button
          label="Trước"
          labelSize={16}
          icon={CaretLeft}
          iconPosition="left"
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => onPageChange(p => p - 1)}
        />

        {getPageItems(currentPage, totalPages).map((item, index) =>
          item === '...' ? (
            <span key={`dots-${index}`} className={styles.dots}>...</span>
          ) : (
            <Button
              key={item}
              labelSize={16}
              label={String(item)}
              variant={currentPage === item ? 'primary' : 'outline'}
              onClick={() => onPageChange(item)}
            />
          )
        )}

        <Button
          label="Tiếp"
          labelSize={16}
          icon={CaretRight}
          iconPosition="right"
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(p => p + 1)}
        />
      </div>
    </>
  )
}

export default CardSearchBase