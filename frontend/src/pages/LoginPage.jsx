

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnvelopeSimple, Eye, EyeSlash } from '@phosphor-icons/react'
import AuthLayout from '../layouts/AuthLayout'
import FormInput from '../components/shared/FormInput'
import Button from '../components/shared/Button'
import styles from './RegisterPage.module.css'
import axiosClient from '../api/axiosClient'
import { useAuth } from '../AuthContext'

function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState({})
    const { login } = useAuth()
    const navigate = useNavigate()

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

    try {
        const res = await axiosClient.post('/auth/login', {
            email: form.email,
            password: form.password,
        })
        const data = res.data
        if (data.token) {
            login(data)
            navigate(data.role === "ADMIN" ? "/admin/coordinator/events" : "/user/dashboard")
        }
    } catch (err) {
        setErrors({ submit: err.response?.data?.message || 'Đăng nhập thất bại' })
    }
}

    return (
        <AuthLayout>
            <div className={styles.wrapper}>
                <h1 className={styles.title}>Đăng nhập</h1>
                <hr className={styles.divider} />

                <form className={styles.form} onSubmit={handleSubmit}>

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

                    <FormInput
                        label="Mật khẩu"
                        required
                        placeholder="Tối thiểu 8 kí tự"
                        type={showPassword ? 'text' : 'password'}
                        iconRight={showPassword ? EyeSlash : Eye}
                        onIconRightClick={() => setShowPassword(p => !p)}
                        value={form.password}
                        onChange={e => setField('password', e.target.value)}
                        status={errors.password ? 'error' : 'default'}
                        message={errors.password}
                    />

                    <div className={styles.submitRow}>
                        <Button
                            label="Đăng nhập"
                            variant="primary"
                            type="submit"
                        />
                        <button type="button" className={styles.forgotLink}>
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
                        <button type="button" className={styles.loginLink}>
                            Tạo tài khoản ngay
                        </button>
                    </p>

                </form>
            </div>
        </AuthLayout>
    )
}

export default LoginPage
