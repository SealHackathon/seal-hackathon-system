import { UserCircleDashed, Hash, UserPlus } from '@phosphor-icons/react'
import Button from '../shared/Button'
import styles from '../leaderView/TeamInfoHeader.module.css'
import noTeamStyles from './NoTeamHeader.module.css'

function NoTeamHeader({ onCreateTeam, onEnterCode }) {
    return (
        <div className={styles.wrapper}>

            <div className={styles.teamInfo}>
                <div className="icon-label">
                    <UserCircleDashed size={32} weight="fill" color="white" />
                    <h1>Bạn chưa có đội</h1>
                </div>
                <p>
                    Bạn có thể tìm kiếm các đội phù hợp và gửi yêu cầu tham gia.<br />
                    Ngoài ra, bạn có thể tự tạo team hoặc nhập mã mời từ bạn bè.
                </p>
            </div>

                <div>

                    <Button
                        className={styles.btn}
                        label="Tạo đội"
                        icon={UserPlus}
                        iconPosition="left"
                        variant='primary'
                        color='green'
                        onClick={onCreateTeam}
                    />
                    <Button
                        className={styles.btn}
                        label="Nhập mã"
                        icon={Hash}
                        iconPosition="left"
                        variant="outline"
                        onClick={onEnterCode}
                    />

            </div>

        </div>
    )
}

export default NoTeamHeader