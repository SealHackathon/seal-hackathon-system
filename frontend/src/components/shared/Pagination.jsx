// Pagination.jsx
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import Button from './Button'
import styles from './CardSearchBase.module.css'

function getPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const items = []
  const delta = 1

  const rangeStart = Math.max(2, currentPage - delta)
  const rangeEnd = Math.min(totalPages - 1, currentPage + delta)

  items.push(1)

  if (rangeStart > 2) items.push('...')

  for (let i = rangeStart; i <= rangeEnd; i++) {
    items.push(i)
  }

  if (rangeEnd < totalPages - 1) items.push('...')

  items.push(totalPages)

  return items
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
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
  )
}

export default Pagination