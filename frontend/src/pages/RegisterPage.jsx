import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCircle, EnvelopeSimple, LockSimple, Eye, EyeSlash, Phone } from '@phosphor-icons/react'
import AuthLayout from '../layouts/AuthLayout'
import FormInput from '../components/shared/FormInput'
import Dropdown from '../components/shared/Dropdown'
import Button from '../components/shared/Button'
import styles from './RegisterPage.module.css'
const ROLE_OPTIONS = [
    { value: 'student_fpt', label: 'Sinh viên Đại học FPT' },
    { value: 'student_other', label: 'Sinh viên trường khác' },
]



function RegisterPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        role: 'student_fpt',
        studentId: '',
        phone: '',
        email: '',
        password: '',
    })

    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState({})

    function setField(key, value) {
        setForm(prev => ({ ...prev, [key]: value }))
        setErrors(prev => ({ ...prev, [key]: '' }))
    }

    function validate() {
        const e = {}
        if (form.role === 'student_fpt' && !form.studentId.trim()) {
            e.studentId = 'Vui lòng nhập mã số sinh viên'
        }
        if (!form.phone.trim()) {
            e.phone = 'Vui lòng nhập số điện thoại'
        }
        if (!form.email.trim()) e.email = 'Vui lòng nhập email'
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ'
        if (!form.password.trim()) e.password = 'Vui lòng nhập mật khẩu'
        else if (form.password.length < 8) e.password = 'Mật khẩu phải có ít nhất 8 ký tự'
        return e
    }

    async function handleSubmit(e) {
        e.preventDefault()

        const e2 = validate()
        if (Object.keys(e2).length > 0) { setErrors(e2); return }

        try {
            const res = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    schoolName: form.role === 'student_fpt' ? 'Đại học FPT' : 'Khác',
                    studentId: form.role === 'student_fpt' ? form.studentId : '',
                    email: form.email,
                    password: form.password,
                    phone: form.phone
                }),
            })
            const data = await res.json()

            if (data === null) {
                setErrors({ email: 'Email hoặc mã số sinh viên đã tồn tại' })
                return
            }

            localStorage.setItem('verifyEmail', form.email)
            localStorage.setItem('registerData', JSON.stringify(form))
            navigate('/verify-email', { state: { email: form.email } })

        } catch {
            console.log('Lỗi kết nối server')
        } finally {
            console.log(form)
        }
    }

    const isFormValid = form.phone && form.email && form.password.length >= 8 &&
        (form.role === 'student_other' || form.studentId)

    return (
        <AuthLayout>
            <div className={styles.wrapper}>
                <h1 className={styles.title}>Đăng ký</h1>
                <hr className={styles.divider} />

                <form className={styles.form} onSubmit={handleSubmit}>

                    {/* Tư cách đăng nhập */}
                    <Dropdown
                        label="Tư cách đăng nhập"
                        labelPosition="side"
                        value={form.role}
                        onChange={v => setField('role', v)}
                        options={ROLE_OPTIONS}
                    />

                    {/* Mã số sinh viên (Chỉ hiện nếu là SV FPT) */}
                    {form.role === 'student_fpt' && (
                        <FormInput
                            label="Mã số sinh viên"
                            required
                            iconLeft={UserCircle}
                            placeholder="SE190346"
                            value={form.studentId}
                            onChange={e => setField('studentId', e.target.value)}
                            status={errors.studentId ? 'error' : 'default'}
                            message={errors.studentId}
                        />
                    )}

                    {/* Email */}
                    <FormInput
                        label="Email"
                        required
                        iconLeft={EnvelopeSimple}
                        placeholder="example@gmail.com"
                        type="email"
                        value={form.email}
                        onChange={e => setField('email', e.target.value)}
                        status={errors.email ? 'error' : 'default'}
                        message={errors.email}
                    />

                    {/* Số điện thoại */}
                    <FormInput
                        label="Số điện thoại"
                        required
                        iconLeft={Phone}
                        placeholder="0123456789"
                        value={form.phone}
                        onChange={e => setField('phone', e.target.value)}
                        status={errors.phone ? 'error' : 'default'}
                        message={errors.phone}
                    />

                    {/* Mật khẩu */}
                    <FormInput
                        label="Mật khẩu"
                        required
                        placeholder="Tối thiểu 8 kí tự"
                        type={showPassword ? 'text' : 'password'}
                        iconLeft={LockSimple}
                        iconRight={showPassword ? EyeSlash : Eye}
                        onIconRightClick={() => setShowPassword(p => !p)}
                        value={form.password}
                        onChange={e => setField('password', e.target.value)}
                        status={errors.password ? 'error' : 'default'}
                        message={errors.password}
                    />

                    <Button
                        label="Đăng kí"
                        variant="primary"
                        type="submit"
                        onClick={()=>handleSubmit}
                    // disabled={!isFormValid || loading}
                    />

                    {errors.submit && (
                        <p className={styles.submitError}>{errors.submit}</p>
                    )}

                    <div className={styles.orRow}>
                        <hr /><span>Hoặc</span><hr />
                    </div>

                    {/* Link đăng nhập */}
                    <p className={styles.loginPrompt}>
                        Đã có tài khoản?{' '}
                        <button
                            type="button"
                            className={styles.loginLink}
                            onClick={()=>navigate("/login")}
                        >
                            Đăng nhập ngay
                        </button>
                    </p>

                </form>

            </div>

        </AuthLayout>
    )
}

export default RegisterPage