import { PencilSimple } from '@phosphor-icons/react'
import styles from './SectionHeader.module.css'
import Tooltip from '../shared/Tooltip'

/**
 * SectionHeader — header bar với 3 style level
 *
 * @param {React.ReactNode} icon       — Phosphor icon component
 * @param {string}          title
 * @param {'h1'|'h2'|'h3'}  [level='h1']
 * @param {boolean}         [editable]
 * @param {function}        [onEdit]
 */
function SectionHeader({ icon: Icon, title, level = 'h1', editable = false, onEdit }) {
  const iconSize = level === 'h1' ? 20 : level === 'h2' ? 17 : 15

  return (
    <div className={`${styles.header} ${styles[level]}`}>
      <div className={styles.left}>
        {Icon && <Icon size={iconSize} weight="fill" />}
        <span>{title}</span>
      </div>

      {editable && (
        <Tooltip content="Chỉnh sửa" bgColor="white" textColor="blue" position="left">
          <button
            className={styles.editBtn}
            onClick={onEdit}
            type="button"
          >
            <PencilSimple size={13} weight="fill" />
          </button>
        </Tooltip>
      )}
    </div>
  )
}

export default SectionHeader