import { useState, useRef, useEffect } from 'react'
import { GearSix, Question, SignOut } from '@phosphor-icons/react'
import styles from './UserMenuDropdown.module.css'
import avatarPlaceholder from '../../assets/user-avatar-placeholder.png'

function UserMenuDropdown({ name, email, avatar }) {
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className={styles.wrapper} ref={ref}>
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
                type='button'
            >
                {avatar
                    ? <img src={avatar} alt="avatar" className={styles.avatar} />
                    : <img src={avatarPlaceholder} alt="avatar placeholder" className={styles.avatar} />
                }
            </button>

            {isOpen && (
                <div className={styles.dropdown}>

                    <div>
                        <p className={styles.name}>{name}</p>
                        <p className={styles.email}>{email}</p>
                    </div>

                    <hr className={styles.divider}/>

                    <ul className={styles.menu}>
                        <li className={`icon-label ${styles.menuItem}`}>
                            <GearSix size={24} color='var(--color-primary-blue)' />
                            <span>Cài đặt</span>
                        </li>

                        <li className={`icon-label ${styles.menuItem}`}>
                            <Question size={24} color='var(--color-primary-blue)'/>
                            <span>Hỗ trợ</span>
                        </li>

                        <li className={styles.divider}></li>

                        <li className={`icon-label ${styles.menuItem} ${styles.logout}`}>
                            <SignOut size={24} color='var(--color-primary-orange)'/>
                            <span>Đăng xuất</span>
                        </li>
                    </ul>

                </div>
            )}
        </div>
    )
}

export default UserMenuDropdown;