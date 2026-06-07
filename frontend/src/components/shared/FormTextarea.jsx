import { WarningCircle } from '@phosphor-icons/react'
import formInputStyles from './FormInput.module.css'
import styles from './FormTextarea.module.css'

function FormTextarea({
  className,
  label,
  required,
  hint,
  iconLeft,
  placeholder,
  value,
  onChange,
  maxLength,
  rows = 4,
  status,
  message,
  disabled,
  name,
}) {
  const IconLeft = iconLeft

  return (
    <div className={`${formInputStyles.wrapper} ${className}`}>

      {label && (
        <label className={formInputStyles.label}>
          {label}
          {required && <span className={formInputStyles.asterisk}> *</span>}
        </label>
      )}

      {hint && <p className={formInputStyles.hint}>{hint}</p>}

      <div className={`${formInputStyles.box} ${styles.boxOverride} ${status ? formInputStyles[status] : ''} ${disabled ? styles.disabled : ''}`}>
        {IconLeft && (
          <span className={formInputStyles.iconLeft}>
            <IconLeft size={28} />
          </span>
        )}
        <textarea
          className={`${styles.textarea} ${className} ${'scrollbar'}`}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          disabled={disabled}
        />
      </div>

      {(message || maxLength) && (
              <div className={formInputStyles.bottom}>
                <div className={formInputStyles.messageContainer}>
                  {status === 'error' && (
                    <span className={`${formInputStyles.iconLeft} ${styles.error}`}>
                      <WarningCircle size={20} weight='bold' color="var(--color-primary-orange)" />
                    </span>
                  )}
                  {message && (
                    <p className={`${formInputStyles.message} ${status ? formInputStyles[status] : ''}`}>
                      {message}
                    </p>
                  )}
                </div>
      
                {maxLength && (
                  <span className={formInputStyles.charCount}>
                    {value?.length ?? 0}/{maxLength}
                  </span>
                )}
              </div>
            )}

    </div>
  )
}

export default FormTextarea