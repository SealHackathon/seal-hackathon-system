import { useState } from 'react';
import Button from '../shared/Button';
import { UsersThree, Copy, MagnifyingGlass, PencilSimple } from "@phosphor-icons/react";
import styles from './TeamInfoHeader.module.css'
import FindMemberModal from './FindMemberModal'
import EditTeamInformationModal from './EditTeamInformationModal';
import Tooltip from '../shared/Tooltip';

function TeamInfoHeader({ teamId, teamName, description, teamCode, isLeader, onEdit }) {
    const [showModal, setShowModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    function handleCopyCode() {
        navigator.clipboard.writeText(teamCode)
    }

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
                        onClose={() => setShowEditModal(false)}
                        onEdit={onEdit}
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
                )
            }


        </div >
    )
}

export default TeamInfoHeader