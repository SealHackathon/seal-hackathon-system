import { useId } from 'react'
import { WarningCircle } from '@phosphor-icons/react'
import styles from './FormInput.module.css'

function FormInput({
  label,
  required,
  labelVariant = 'default', // 'default' | 'small'
  labelColorVariant = '', //  'dark' | 'primary' | 'secondary' | 'border'
  hint,
  iconLeft,
  iconRight,
  iconSize = 28,
  iconWeight = 'regular',
  iconColor,
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
  id,
  ...rest
}) {

  const autoId = useId()                    //* React 18 — tự sinh id unique --> Tăng tính accessibility
  const inputId = id ?? name ?? autoId      // * ưu tiên: id prop > name > auto


  const IconLeft = iconLeft
  const IconRight = iconRight
  const ActionIcon = actionIcon

  return (
    <div className={styles.wrapper}>
      {label && (
        <label
          htmlFor={inputId}
          className={`${styles.label} ${labelVariant === 'small' ? styles.labelSmall : ''} ${styles[labelColorVariant] || ''}`}>
          {label}
          {required && <span className={styles.asterisk}> *</span>}
        </label>
      )}

      {hint && <p className={styles.hint}>{hint}</p>}

      <div className={styles.inputRow}>

        <div className={`${styles.box} ${status ? styles[status] : ''} ${disabled ? styles.disabled : ''}`}>
          {IconLeft && (
            <span className={styles.iconLeft}>
              <IconLeft size={iconSize} weight={iconWeight} color={iconColor} />
            </span>
          )}

          <input
            className={styles.input}
            id={inputId}
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
              <IconRight size={iconSize} weight={iconWeight} color={iconColor} />
            </button>
          )}
        </div>

        {ActionIcon && (
          <span
            className={styles.actionIcon}
            onClick={onActionIconClick}
            style={onActionIconClick ? { cursor: 'pointer' } : {}}
          >
            <ActionIcon size={iconSize} weight={iconWeight} color={iconColor} />
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