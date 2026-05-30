import { useState } from 'react'
import styles from './NavPill.module.css'

function NavPill({ icon: Icon, label, isActive, onClick }) {
    const [isHover, setIsHover] = useState(false)
    const weight = isHover || isActive ? 'fill' : 'regular'

    return (
        <button 
            className= {` ${styles.pill} ${isActive ? styles.isActive : ''} `}
            type='button'
            onClick={onClick}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
        >
                <span className={styles.icon}><Icon size={32} weight={weight}></Icon></span>
                <span className={styles.label}>{label}</span>
        </button>
    )
}

export default NavPill