import { WarningCircle } from '@phosphor-icons/react'
import styles from './FormInput.module.css'

function FormInput({
  label,
  required,
  hint,
  iconLeft,
  iconRight,
  onIconRightClick,
  actionIcon,           // icon nằm ngoài input, bên phải
  onActionIconClick,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  maxLength,
  status,              // 'default' | 'error' | 'success'
  message,             // error hoặc success message
  disabled,
  name,
  ...rest
}) {
  const IconLeft = iconLeft
  const IconRight = iconRight
  const ActionIcon = actionIcon

  return (
    <div className={styles.wrapper}>

      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.asterisk}> *</span>}
        </label>
      )}

      {hint && <p className={styles.hint}>{hint}</p>}

      <div className={styles.inputRow}>

        <div className={`${styles.box} ${status ? styles[status] : ''} ${disabled ? styles.disabled : ''}`}>
          {IconLeft && (
            <span className={styles.iconLeft}>
              <IconLeft size={28} />
            </span>
          )}

          <input
            className={styles.input}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
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
              <IconRight size={28} />
            </button>
          )}
        </div>

        {ActionIcon && (
          <span
            className={styles.actionIcon}
            onClick={onActionIconClick}
            style={onActionIconClick ? { cursor: 'pointer' } : {}}
          >
            <ActionIcon size={28} />
          </span>
        )}

      </div>

      {(message || maxLength) && (
        <div className={styles.bottom}>
          <div className={styles.messageContainer}>
            {status === 'error' && (
              <span className={`${styles.iconLeft} ${styles.error}`}>
                <WarningCircle size={20} weight='bold' color="var(--color-primary-orange)" />
              </span>
            )}
            {message && (
              <p className={`${styles.message} ${status ? styles[status] : ''}`}>
                {message}
              </p>
            )}
          </div>

          {maxLength && (
            <span className={styles.charCount}>
              {value?.length ?? 0}/{maxLength}
            </span>
          )}
        </div>
      )}

    </div>
  )
}

export default FormInput