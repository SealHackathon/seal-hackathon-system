import styles from './Button.module.css'

function Button({
    className = '',
    label,
    labelSize = 20,
    color = 'blue', // 'blue', 'green', 'orange'
    variant = 'primary',    // 'primary', 'outline'
    icon: Icon,
    iconPosition = 'left',  // 'left', 'right'
    iconWeight = 'bold', // 'fill', 'regular', 'bold'
    iconColor,
    iconSize = 24,
    onClick,
    disabled = false,
    type = 'button',
}) {
    return (
        <button
            type={type}
            className={`${styles.btn} ${styles[variant]} ${styles[color]} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            <div>

            </div>

            {Icon && iconPosition === 'left' && (
                <span className={styles.icon}>
                    <Icon size={iconSize} weight={iconWeight} color={iconColor}/>
                </span>
            )}

            <span style={{ fontSize: `${labelSize}px` }}>{label}</span>
 
            {Icon && iconPosition === 'right' && (
                <span className={styles.icon}>
                    <Icon size={iconSize} weight={iconWeight} color={iconColor}/>
                </span>
            )}
        </button>
    )
}

export default Button