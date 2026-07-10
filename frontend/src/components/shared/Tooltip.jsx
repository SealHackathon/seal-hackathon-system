import React, { useState } from 'react'
import { createPortal } from 'react-dom' // * cái này để render cái component ra thẳng ngoài DOM luôn, không bị ảnh hưởng bởi overflow: hidden của thằng cha
import styles from './Tooltip.module.css'

function Tooltip({
    children,
    content,
    contentSize = 14,
    bgColor = 'blue', // "blue", "green", "orange", "white"
    textColor = 'white', // "blueTxt", "greenTxt", "orangeTxt", "whiteTxt"
    position = 'top', // "top", "bottom", "right", "left"
    wrapperClassName = '',
    wrapperStyle = {},
    forceVisible = undefined // optional prop để parent điều khiển
}) {
    const [visible, setVisible] = useState(false)
    const [coords, setCoords] = useState({ top: 0, left: 0 })
    const wrapperRef = React.useRef(null)

    // Handle forceVisible changes
    React.useEffect(() => {
        if (forceVisible !== undefined) {
            if (forceVisible && wrapperRef.current) {
                const rect = wrapperRef.current.getBoundingClientRect()
                updateCoords(rect)
                setVisible(true)
            } else {
                setVisible(false)
            }
        }
    }, [forceVisible, position])

    function updateCoords(rect) {
        let top, left
        if (position === 'bottom') {
            top = rect.bottom + 8
            left = rect.left + rect.width / 2
        } else if (position === 'top') {
            top = rect.top - 8          // gần mép trên element
            left = rect.left + rect.width / 2
        } else if (position === 'left') {
            top = rect.top + rect.height / 2
            left = rect.left - 8
        } else if (position === 'right') {
            top = rect.top + rect.height / 2
            left = rect.right + 8
        }
        setCoords({ top, left })
    }

    function handleMouseEnter(e) {
        if (forceVisible !== undefined) return; // if controlled by parent, don't handle locally
        const rect = e.currentTarget.getBoundingClientRect()
        updateCoords(rect)
        setVisible(true)
    }

    function handleMouseLeave() {
        if (forceVisible !== undefined) return;
        setVisible(false)
    }


    if (!content) return children

    return (
        <div
            ref={wrapperRef}
            className={`${styles.wrapper} ${wrapperClassName}`}
            style={wrapperStyle}
            onMouseEnter={handleMouseEnter} // * tính toán vị trí trước khi render tooltip
            onMouseLeave={handleMouseLeave}
        >
            {children}

            {visible && createPortal(
                <div className={`${styles.tooltip} ${styles[position]} ${styles[bgColor] || ''}`}
                    style={{
                        position: 'fixed',
                        top: coords.top,
                        left: coords.left,
                        transform: 'translateX(-50%)',
                        zIndex: 9999,
                    }}
                >
                    <div className={styles[textColor] || ''} style={{ fontSize: `${contentSize}px` }}>{content}</div>
                    <span className={styles.arrow} />
                </div>,

                document.body // * render ra ngoài DOM
            )}
        </div>
    )
}

export default Tooltip