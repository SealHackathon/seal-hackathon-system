import styles from './FieldGroup.module.css'


function FieldGroup({ 
    icon, // icon    : Phosphor icon component (optional)
    title, // title   : tên section lớn
    required, // required: hiện dấu * cam
    layout = 'column', // layout  : 'column' (default) | 'row'
    children 
}) {
  const Icon = icon

  return (
    <div className={styles.group}>

      {/* ── Section title ── */}
      {title && (
        <div className={styles.header}>
          {Icon && <Icon size={24} weight="fill" className={styles.icon} />}
          <p className={styles.title}>
            {title}
            {required && <span className={styles.asterisk}>*</span>}
          </p>
        </div>
      )}

      {/* ── Fields: column hoặc row ── */}
      <div className={`${styles.fields} ${layout === 'row' ? styles.fieldsRow : styles.fieldsColumn}`}>
        {children}
      </div>

    </div>
  )
}

export default FieldGroup