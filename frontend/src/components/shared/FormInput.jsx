import styles from './FormInput.module.css'

function FormInput({
  label,
  required,
  hint,
  iconLeft,
  iconRight,
  onIconRightClick,
  actionIcon,           // icon nằm ngoài input, bên phải
  type = 'text',
  value,
  onChange,
  placeholder,
  maxLength,
  status,              // 'default' | 'error' | 'success'
  message,             // error hoặc success message
  disabled,
  name,
  ...rest
}) {
  const IconLeft  = iconLeft
  const IconRight = iconRight
  const ActionIcon = actionIcon

  return (
    <div className={styles.wrapper}>

      {/* Label */}
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.asterisk}> *</span>}
        </label>
      )}

      {/* Hint */}
      {hint && <p className={styles.hint}>{hint}</p>}

      {/* Input row */}
      <div className={styles.inputRow}>

        {/* Input box */}
        <div className={`${styles.inputBox} ${status ? styles[status] : ''} ${disabled ? styles.disabled : ''}`}>
          {IconLeft && (
            <span className={styles.iconLeft}>
              <IconLeft size={24} />
            </span>
          )}

          <input
            className={styles.input}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            {...rest}
          />

          {IconRight && (
            <button
              type="button"
              className={styles.iconRight}
              onClick={onIconRightClick}
              tabIndex={-1}
            >
              <IconRight size={24} />
            </button>
          )}
        </div>

        {ActionIcon && (
          <span className={styles.actionIcon}>
            <ActionIcon size={24} />
          </span>
        )}

      </div>

      {/* Bottom row: message + char count */}
      <div className={styles.bottom}>
        {message && (
          <p className={`${styles.message} ${status ? styles[status] : ''}`}>
            {message}
          </p>
        )}
        {maxLength && (
          <span className={styles.charCount}>
            {value?.length ?? 0}/{maxLength}
          </span>
        )}
      </div>

    </div>
  )
}

export default FormInput