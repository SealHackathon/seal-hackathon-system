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

export default function Step3StudentInfo({ onNext, onBack, initialData, onSaveData }) {
    const [school, setSchool] = useState(initialData?.school || '')
    const [customSchool, setCustomSchool] = useState(initialData?.customSchool || '')
    const [studentId, setStudentId] = useState(initialData?.studentId || '')
    const [cardFile, setCardFile] = useState(initialData?.cardFile || initialData?.img_studentcard || null)
    const [cardAspectRatio, setCardAspectRatio] = useState(initialData?.cardAspectRatio || 4 / 3)   // default landscape
    const [cardOrientation, setCardOrientation] = useState(initialData?.cardOrientation || null)    // 'landscape' | 'portrait'
    const [loading, setLoading] = useState(false)
    const [apiSuccess, setApiSuccess] = useState(initialData?.apiSuccess || false)

    const schoolValid = school && (school !== 'other' || customSchool.trim())
    const canSubmit = schoolValid && studentId.trim() && cardFile

    function saveData(successOverride) {
        const isSuccess = successOverride !== undefined ? successOverride : apiSuccess
        onSaveData?.({ school, customSchool, studentId, cardFile, cardAspectRatio, cardOrientation, apiSuccess: isSuccess })
    }

    function handleBack() {
        saveData()
        onBack()
    }

    async function handleNext() {
        if (!canSubmit || loading) return

        // Bỏ qua gọi API nếu đã gửi thành công trước đó (dữ liệu chưa đổi)
        if (apiSuccess) {
            saveData()
            onNext()
            return
        }

        setLoading(true)
        const fd = new FormData()
        fd.append('school',           school === 'other' ? customSchool.trim() : school)
        fd.append('mssv',       studentId.trim())
        fd.append('file', cardFile)
        try {
            const res = await axiosClient.post('/kyc/student-card', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            // res.data chứa trực tiếp chuỗi URL Cloudinary
            if (res.data && typeof res.data === 'string') {
                setCardFile(res.data)
            }
            setApiSuccess(true)
            // Lấy trực tiếp res.data truyền vào saveData nếu backend trả về, 
            // nhưng vì setCardFile là async nên ta truyền trực tiếp vào saveData để cập nhật kịp thời
            const latestCardFile = (res.data && typeof res.data === 'string') ? res.data : cardFile
            onSaveData?.({ school, customSchool, studentId, cardFile: latestCardFile, cardAspectRatio, cardOrientation, apiSuccess: true })
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
                        onChange={val => { setSchool(val); setCustomSchool(''); setApiSuccess(false); }}
                        searchable
                        disabled={loading}
                    />
                    <FormInput
                        label="Mã số sinh viên" required
                        placeholder="XXXXXXXXXXXXX"
                        value={studentId}
                        onChange={e => { setStudentId(e.target.value); setApiSuccess(false); }}
                        disabled={loading}
                    />
                </div>

                {school === 'other' && (
                    <FormInput
                        label="Tên trường của bạn" required
                        placeholder="Nhập tên trường đại học..."
                        value={customSchool}
                        onChange={e => { setCustomSchool(e.target.value); setApiSuccess(false); }}
                        disabled={loading}
                    />
                )}

                <div className={`${styles.uploadArea} ${cardOrientation ? styles[cardOrientation] : ''}`}>
                    <FileUpload
                        label="Thẻ sinh viên" required
                        accept={ACCEPT_IMG}
                        maxSizeMB={5}
                        aspectRatio={cardAspectRatio}
                        value={cardFile}
                        onFileChange={file => {
                            setCardFile(file)
                            setApiSuccess(false)
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
                        onClick={handleBack} disabled={loading}
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
