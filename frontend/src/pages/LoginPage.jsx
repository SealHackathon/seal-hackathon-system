import { useState } from 'react'
import { EnvelopeSimple, Eye, EyeSlash } from '@phosphor-icons/react'
import AuthLayout from '../layouts/AuthLayout'
import FormInput from '../components/shared/FormInput'
import Button from '../components/shared/Button'
import styles from './RegisterPage.module.css'

function LoginPage() {

    const [form, setForm] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    function setField(key, value) {
        setForm(prev => ({ ...prev, [key]: value }))
        setErrors(prev => ({ ...prev, [key]: '' }))
    }

    function validate() {
        const e = {}
        if (!form.email.trim()) e.email = 'Vui lòng nhập email'
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ'
        if (!form.password.trim()) e.password = 'Vui lòng nhập mật khẩu'
        return e
    }

    async function handleSubmit(e) {
        e.preventDefault()

        const e2 = validate()
        if (Object.keys(e2).length > 0) { setErrors(e2); return }

        setLoading(true)
        try {
            const res = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()

            if (!data || data.error) {
                setErrors({ submit: 'Email hoặc mật khẩu không đúng' })
                return
            }

            localStorage.setItem('token', data.token)

        } catch {
            setErrors({ submit: 'Không thể kết nối tới máy chủ' })
        } finally {
            setLoading(false)
        }
    }

    const isFormValid = form.email && form.password

    return (
        <AuthLayout>
            <div className={styles.wrapper}>
                <h1 className={styles.title}>Đăng nhập</h1>
                <hr className={styles.divider} />

                <form className={styles.form} onSubmit={handleSubmit}>

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

                    {/* Mật khẩu */}
                    <FormInput
                        label="Mật khẩu"
                        required
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        iconRight={showPassword ? EyeSlash : Eye}
                        onIconRightClick={() => setShowPassword(p => !p)}
                        value={form.password}
                        onChange={e => setField('password', e.target.value)}
                        status={errors.password ? 'error' : 'default'}
                        message={errors.password}
                    />

                    {/* Submit row */}
                    <div className={styles.submitRow}>
                        <Button
                            label="Đăng nhập"
                            variant="primary"
                            type="submit"
                            // disabled={!isFormValid || loading}
                        />
                        <button
                            type="button"
                            className={styles.forgotLink}
                        >
                            Quên mật khẩu?
                        </button>
                    </div>

                    {errors.submit && (
                        <p className={styles.submitError}>{errors.submit}</p>
                    )}

                    <div className={styles.orRow}>
                        <hr /><span>Hoặc</span><hr />
                    </div>

                    <p className={styles.loginPrompt}>
                        Chưa có tài khoản?{' '}
                        <button
                            type="button"
                            className={styles.loginLink}
                        >
                            Tạo tài khoản ngay
                        </button>
                    </p>

                </form>
            </div>
        </AuthLayout>
    )
}

export default LoginPage