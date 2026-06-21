import { PencilSimple } from '@phosphor-icons/react'
import styles from './SectionHeader.module.css'
import Tooltip from '../shared/Tooltip'

/**
 * SectionHeader — blue filled header bar
 *
 * @param {React.ReactNode} icon     — icon bên trái (phosphor icon component)
 * @param {string}          title
 * @param {boolean}         [editable] — hiện nút chỉnh sửa
 * @param {function}        [onEdit]
 */
function SectionHeader({ icon: Icon, title, editable = false, onEdit }) {
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        {Icon && <Icon size={18} weight="fill" />}
        <span>{title}</span>
      </div>

      {editable && (
        <Tooltip content="Chỉnh sửa" bgColor="white" textColor="blue" position='left'>
          <button
            className={styles.editBtn}
            onClick={onEdit}
            type="button"
          >
            <PencilSimple size={15} weight="fill" />
          </button>
        </Tooltip>
      )}
    </div>
  )
}

export default SectionHeader
