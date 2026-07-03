import { useState } from 'react';
import Button from '../shared/Button';
import { UsersThree, Copy, MagnifyingGlass, PencilSimple } from "@phosphor-icons/react";
import styles from './TeamInfoHeader.module.css'
import FindMemberModal from './FindMemberModal'
import EditTeamInformationModal from './EditTeamInformationModal';
import Tooltip from '../shared/Tooltip';

function TeamInfoHeader({ teamId, teamName, teamStatus, description, teamCode, emptyCount, isLeader, onEdit, onRefresh }) {
    const [showModal, setShowModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [isCopied, setIsCopied] = useState(false)

    function handleCopyCode() {
        navigator.clipboard.writeText(teamCode)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 1500)
    }

    const copyLabel = (
        <span className={styles.copyLabelWrapper}>
            <span className={`${styles.copyLabelInner} ${isCopied ? styles.copied : ''}`}>
                <span className={styles.copyText}>{teamCode}</span>
                <span className={styles.copyText}>Đã sao chép</span>
            </span>
        </span>
    )

    // check xem team đủ thành viên chưa, đủ thì disable cái nút tìm thành viên bên LeaderView

    return (
        <div className={styles.wrapper}>

            <div className={styles.teamInfo}>
                <div className={styles.teamInfoHeading}>
                    <div className="icon-label">
                        <UsersThree size={32} weight="fill" color={'white'}></UsersThree>
                        <h1>{teamName}</h1>
                    </div>

                    {isLeader && (
                        <Tooltip content="Chỉnh sửa" bgColor="white" textColor="blue" position='right'>
                            <button
                                className={styles.edit}
                                onClick={() => { setShowEditModal(true) }}
                                type='button'
                            >
                                <PencilSimple size={24} weight='fill' ></PencilSimple>
                            </button>
                        </Tooltip>
                    )}


                </div>
                <p>{description}</p>
            </div>


            {
                showEditModal && (
                    <EditTeamInformationModal
                        teamId={teamId}
                        teamName={teamName}
                        description={description}
                        onClose={(isSuccess) => {
                            setShowEditModal(false);
                            if (isSuccess && onRefresh) onRefresh();
                        }}
                    // onEdit={onEdit}
                    />
                )
            }

            {isLeader && (<div className={styles.divider}></div>)}

            {/* ấm vào tìm member thì sẽ show ra list này */}
            {
                isLeader && (

                    <div>
                        <div className={styles.codeBox}>
                            <span>Mã đội:</span>
                            <Button className={styles.btn} icon={isCopied ? null : Copy} label={copyLabel} variant="outline" color={isCopied ? 'green' : 'blue'} onClick={handleCopyCode} />
                        </div>
                        <Button
                            className={styles.btn}
                            icon={MagnifyingGlass}
                            label="Tìm thành viên"
                            variant="outline"
                            color='blue'
                            onClick={() => setShowModal(true)}
                            disabled={emptyCount == 0 || teamStatus === 'PENDING_APPROVAL'}
                        />

                        {showModal && (
                            <FindMemberModal
                                onClose={() => {
                                    setShowModal(false);
                                    if(onRefresh) onRefresh();
                                }}
                            />
                        )}
                    </div>
                )
            }


        </div >
    )
}

export default TeamInfoHeader