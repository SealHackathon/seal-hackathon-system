import { UserCircle, EnvelopeSimple, Buildings } from '@phosphor-icons/react'
import UserLayout from '../layouts/UserLayout'
import FormInput from '../components/shared/FormInput'
import Dropdown from '../components/shared/Dropdown'
import Button from '../components/shared/Button'
import { schoolOptions } from '../data/schoolList'
import styles from './RegisterPage.module.css'
import { useState } from 'react'

const FAKE_EMAIL = 'ntbi533@gmail.com'
const FAKE_STUDENTID = 'SE190346'

function CompleteProfilePage() {
  const [form, setForm] = useState({
    name: '',
    school: null,
    studentId: '',
  })

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    console.log('Hoàn tất đăng ký:', form)
  }

  const isFormValid = 
        form.name.trim() && 
        form.school && 
        (form.school !== 'other' || form.schoolName.trim())

  return (
    <UserLayout>
      <div className={styles.wrapper}>
        <h1 className={`${styles.title} ${'icon-label'}`}>
          <UserCircle size={36} />
          Hoàn thiện thông tin
        </h1>

        <p className={styles.subtitle}>
          Hoàn thiện đầy đủ và chính xác thông tin để giúp quá trình
          xác thực thông tin diễn ra nhanh hơn bạn nhé.
        </p>

        <hr className={styles.divider} />

        <div className={styles.form}>

          {/* Họ và tên */}
          <FormInput
            label="Họ và tên"
            required
            iconLeft={UserCircle}
            placeholder="Nguyễn Thành Thái"
            value={form.name}
            onChange={e => setField('name', e.target.value)}
          />

          {/* Email — readonly */}
          <FormInput
            label="Email"
            iconLeft={EnvelopeSimple}
            value={FAKE_EMAIL}
            onChange={() => { }}
            disabled
          />

          {/* Trường đại học */}
          <Dropdown
            label="Trường đại học"
            required
            icon={Buildings}
            placeholder="Chọn từ danh sách"
            value={form.school}
            onChange={v => setField('school', v)}
            options={schoolOptions}
            searchable
          />
          
          {form.school === 'other' && (
            <FormInput
              label="Tên trường"
              required
              hint='Hãy nhập tên trường bạn đang theo học. BTC sẽ kiểm tra lại thông tin nên bạn hãy nhập chính xác nhé.'
              placeholder="Đại học ..."
              onChange={e => setField('schoolName', e.target.value)}  
              // Chỗ này chỉ đổi schoolName thôi, nếu đổi school thì nó sẽ mất cái input field, do đang check form.school === 'other'
            />
          )}

          {/* Mã số sinh viên — readonly */}
          <FormInput
            label="Mã số sinh viên"
            iconLeft={UserCircle}
            value={FAKE_STUDENTID}
            onChange={() => { }}
            disabled
          />

          <Button
            label="Hoàn tất đăng kí"
            variant="primary"
            disabled={!isFormValid}
            onClick={handleSubmit}
          />

        </div>
      </div>
    </UserLayout>
  )
}

export default CompleteProfilePage