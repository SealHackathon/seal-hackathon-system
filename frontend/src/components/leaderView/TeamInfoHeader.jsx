import { useState } from 'react';
import Button from '../shared/Button';
import { UsersThree, Copy, MagnifyingGlass } from "@phosphor-icons/react";
import styles from './TeamInfoHeader.module.css'
import FindMemberModal from './FindMemberModal'
function TeamInfoHeader({ teamName, description, teamCode, showFindMember = true }) {
    const [showModal, setShowModal] = useState(false)

    function handleCopyCode() {
        navigator.clipboard.writeText(teamCode)
    }

    return (
        <div className={styles.wrapper}>

            <div className={styles.teamInfo}>
                <div className="icon-label">
                    <UsersThree size={32} weight="fill" color={'white'}></UsersThree>
                    <h1>{teamName}</h1>
                </div>

                <p>{description}</p>
            </div>

            {/* ấm vào tìm member thì sẽ show ra list này */}
            {showFindMember && (
                <div>
                    <div className={styles.codeBox}>
                        <span>Mã đội:</span>
                        <Button className={styles.btn} icon={Copy} label={teamCode} variant="outline" color='blue' onClick={handleCopyCode} />
                    </div>
                    <Button
                        className={styles.btn}
                        icon={MagnifyingGlass}
                        label="Tìm thành viên"
                        variant="outline"
                        color='blue'
                        onClick={() => setShowModal(true)}
                    />

                    {showModal && (
                        <FindMemberModal
                            onClose={() => setShowModal(false)}
                        />
                    )}
                </div>
            )}


        </div>
    )
}

export default TeamInfoHeader