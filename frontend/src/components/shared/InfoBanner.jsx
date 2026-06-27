import { Info, CheckCircle, Warning } from '@phosphor-icons/react'
import styles from './InfoBanner.module.css'

const VARIANT_CONFIG = {
  blue:   { className: styles.blue,   Icon: Info },
  green:  { className: styles.green,  Icon: CheckCircle },
  orange: { className: styles.orange, Icon: Warning },
}

/**
 * InfoBanner — notice box
 *
 * @param {'blue'|'green'|'orange'} [variant]
 * @param {React.ReactNode}         children
 * @param {boolean}                 [showIcon]
 */
function InfoBanner({ variant = 'blue', children, showIcon = true }) {
  const { className, Icon } = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.blue

  return (
    <div className={`${styles.banner} ${className}`}>
      {showIcon && <Icon size={18} weight="fill" className={styles.icon} />}
      <div>{children}</div>
    </div>
  )
}

export default InfoBanner
