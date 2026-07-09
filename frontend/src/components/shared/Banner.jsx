import styles from './Banner.module.css'

/**
 * Banner — thông báo linh hoạt
 *
 * Props:
 *   color     : 'blue' | 'green' | 'orange' | 'gray'          (default 'blue')
 *   variant   : 'solid' | 'dashed' | 'flat'                   (default 'solid')
 *               solid  — nền màu nhạt + viền liền
 *               dashed — nền màu nhạt + viền đứt
 *               flat   — nền màu nhạt, không viền
 *   icon      : Phosphor icon component                       (optional)
 *   iconSize  : number                                         (default 20)
 *   iconWeight: 'regular'|'bold'|'fill'|'duotone'             (default 'fill')
 *   title     : string | JSX                                   (optional)
 *   message   : string | JSX                                   (optional)
 *   badge     : string | JSX  — góc trên phải               (optional)
 *   detail    : string | JSX  — phần nội dung bổ sung       (optional)
 *   buttons   : JSX           — cột button bên phải         (optional)
 *   className : string                                         (optional)
 */
function Banner({
    color = 'blue',
    variant = 'solid',
    icon: Icon,
    iconSize = 42,
    iconWeight = 'fill',
    title,
    message,
    badge,
    detail,
    buttons,
    className = '',
}) {
    const hasRight = badge || buttons

    return (
        <div className={[
            styles.banner,
            styles[color],
            styles[variant],
            className,
        ].filter(Boolean).join(' ')}>

            {/* Icon */}
            {Icon && (
                <div className={styles.icon}>
                    <Icon size={iconSize} weight={iconWeight} />
                </div>
            )}

            {/* Body */}
            <div className={styles.body}>
                {title && <div className={styles.title}>{title}</div>}
                {message && <p className={styles.message}>{message}</p>}
                {detail && <div className={styles.detail}>{detail}</div>}
            </div>

            {/* Right: badge + buttons */}
            {hasRight && (
                <div className={styles.right}>
                    {badge && <span className={styles.badge}>{badge}</span>}
                    {buttons && <div className={styles.buttons}>{buttons}</div>}
                </div>
            )}

        </div>
    )
}

export default Banner
