import { useState } from 'react'
import { ArrowLeft, ArrowRight, Buildings } from '@phosphor-icons/react'
import axiosClient from '../../../api/axiosClient'
import Button from '../../../components/shared/Button'
import Dropdown from '../../../components/shared/Dropdown'
import FormInput from '../../../components/shared/FormInput'
import FileUpload from '../../../components/shared/FileUpload'
import ProfileStepper from '../../../components/shared/ProfileStepper'
import { schoolOptions } from '../../../data/schoolList'
import styles from './Step3StudentInfo.module.css'

const ACCEPT_IMG = ['image/png', 'image/jpeg', 'image/jpg']

export default function Step3StudentInfo({ onNext, onBack }) {
    const [school, setSchool] = useState('')
    const [customSchool, setCustomSchool] = useState('')
    const [studentId, setStudentId] = useState('')
    const [cardFile, setCardFile] = useState(null)
    const [cardAspectRatio, setCardAspectRatio] = useState(4 / 3)   // default landscape
    const [cardOrientation, setCardOrientation] = useState(null)    // 'landscape' | 'portrait'
    const [loading, setLoading] = useState(false)

    const schoolValid = school && (school !== 'other' || customSchool.trim())
    const canSubmit = schoolValid && studentId.trim() && cardFile

    async function handleNext() {
        if (!canSubmit || loading) return
        setLoading(true)
        const fd = new FormData()
        fd.append('school',           school === 'other' ? customSchool.trim() : school)
        fd.append('mssv',       studentId.trim())
        fd.append('file', cardFile)
        try {
            await axiosClient.post('/kyc/student-card', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            onNext()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.card}>
            <aside className={styles.sidebar}>
                <ProfileStepper currentStep={3} />
            </aside>

            <div className={styles.content}>
                <h1 className={styles.pageTitle}>Thông tin sinh viên</h1>

                <div className={styles.formRow}>
                    <Dropdown
                        label="Trường đại học" required
                        icon={Buildings}
                        placeholder="Chọn từ danh sách"
                        options={schoolOptions}
                        value={school}
                        onChange={val => { setSchool(val); setCustomSchool('') }}
                        searchable
                        disabled={loading}
                    />
                    <FormInput
                        label="Mã số sinh viên" required
                        placeholder="XXXXXXXXXXXXX"
                        value={studentId}
                        onChange={e => setStudentId(e.target.value)}
                        disabled={loading}
                    />
                </div>

                {school === 'other' && (
                    <FormInput
                        label="Tên trường của bạn" required
                        placeholder="Nhập tên trường đại học..."
                        value={customSchool}
                        onChange={e => setCustomSchool(e.target.value)}
                        disabled={loading}
                    />
                )}

                <div className={`${styles.uploadArea} ${cardOrientation ? styles[cardOrientation] : ''}`}>
                    <FileUpload
                        label="Thẻ sinh viên" required
                        accept={ACCEPT_IMG}
                        maxSizeMB={5}
                        aspectRatio={cardAspectRatio}
                        onFileChange={file => {
                            setCardFile(file)
                            if (!file) {
                                setCardAspectRatio(4 / 3)
                                setCardOrientation(null)
                                return
                            }
                            if (!file.type.startsWith('image/')) return
                            const url = URL.createObjectURL(file)
                            const img = new Image()
                            img.onload = () => {
                                const ratio = img.naturalWidth / img.naturalHeight
                                setCardAspectRatio(ratio)
                                setCardOrientation(ratio >= 1 ? 'landscape' : 'portrait')
                                URL.revokeObjectURL(url)
                            }
                            img.src = url
                        }}
                    />
                </div>

                <div className={styles.footer}>
                    <Button
                        label="Quay lại" variant="outline"
                        icon={ArrowLeft} iconPosition="left" iconSize={20}
                        onClick={onBack} disabled={loading}
                    />
                    <Button
                        label="Tiếp tục"
                        icon={ArrowRight} iconPosition="right" iconSize={20}
                        disabled={!canSubmit || loading}
                        onClick={handleNext}
                    />
                </div>
            </div>
        </div>
    )
}
