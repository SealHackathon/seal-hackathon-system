import styles from './RadioCardGroup.module.css'

/**
 * RadioCardGroup — chọn 1 trong nhiều option dạng card
 *
 * Props:
 *   options  : Array<{
 *                value       : string
 *                icon        : Phosphor icon component  (optional)
 *                iconWeight  : string                   (default 'fill')
 *                label       : string
 *                description : string                   (optional)
 *                disabled    : boolean                  (optional)
 *              }>
 *   value    : string   giá trị đang chọn
 *   onChange : (value: string) => void
 *   columns  : number   số cột  (default 2)
 */
function RadioCardGroup({ options = [], value, onChange, columns = 2 }) {
    return (
        <div
            className={styles.group}
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
            {options.map(opt => {
                const isSelected = opt.value === value
                const Icon = opt.icon

                return (
                    <button
                        key={opt.value}
                        type="button"
                        disabled={opt.disabled}
                        className={[
                            styles.card,
                            isSelected && styles.selected,
                            opt.disabled && styles.disabled,
                        ].filter(Boolean).join(' ')}
                        onClick={() => !opt.disabled && onChange?.(opt.value)}
                    >
                        {Icon && (
                            <span className={styles.icon}>
                                <Icon
                                    size={32}
                                    weight={opt.iconWeight ?? 'fill'}
                                />
                            </span>
                        )}

                        <span className={styles.text}>
                            <span className={styles.label}>{opt.label}</span>
                            {opt.description && (
                                <span className={styles.description}>
                                    {opt.description}
                                </span>
                            )}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}

export default RadioCardGroup
