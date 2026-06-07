import styles from './Counter.module.css'

const FACES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const ANGLE = -360 / FACES.length 
// Thằng này giúp xác định mỗi FACE nằm cách nhau góc bao nhiêu độ
// Dấu trừ của thằng này giúp điều chỉnh 
// - Cái trục quay sẽ quay lên hay quay xuống (Đối với Rotator)
// - Cái thứ tự xếp các mặt số (Đối với faces)

function Counter({ number }) {
    return (
        <div className={styles.counter}>
            <div className={styles.scene}>
                <div
                    className={styles.rotator}

                    // Cái trục xoay. RotateX dương thì xoay xuống dưới, âm thì xoay lên trên.
                    style={{ transform: `rotateX(${-number * ANGLE}deg)` }}
                >
                    {FACES.map((face, i) => (
                        <div
                            key={face}
                            className={styles.face}
                            // Xác định xếp số thế nào 
                            // - Âm thì xếp từ dưới lên trên 
                            //     2
                            //     1
                            // --- 0 ---> (Trục xoay)

                            // - Dương thì xếp từ trên xuống dưới
                            // --- 0 ---> (Trục xoay)
                            //     1
                            //     2
                            style={{ transform: `rotateX(${i * ANGLE}deg) translateZ(4rem)` }}
                        >
                            {face}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Counter