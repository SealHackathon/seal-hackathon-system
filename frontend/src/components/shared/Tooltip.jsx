import { useState } from 'react'
import styles from './Tooltip.module.css'

function Tooltip({ 
    children, 
    content, 
    position = 'top',
    color }) {
    const [visible, setVisible] = useState(false)

    if (!content) return children

    return (
        <div
            className={styles.wrapper}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}

            {visible && (
                <div className={`${styles.tooltip} ${styles[position]} ${styles.color}`}>
                    {content}
                    <span className={styles.arrow} />
                </div>
            )}
        </div>
    )
}

export default Tooltip