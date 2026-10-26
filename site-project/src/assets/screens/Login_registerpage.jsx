import React, { useState } from 'react';
import '../css/register.css';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { credentialsReceived } from '../../store/authSlice';

const API_URL = import.meta.env.VITE_API_URL;

const emailLooksValid = (email) => /\S+@\S+\.\S+/.test(email);

function LoginRegisterPage() {
    const [isRegisterActive, setIsRegisterActive] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // --- register ---------------------------------------------------------
    const [reg, setReg] = useState({ name: '', email: '', phone: '', password: '' });
    const [regErrors, setRegErrors] = useState({});
    const [regBusy, setRegBusy] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);

    // --- login ------------------------------------------------------------
    const [login, setLogin] = useState({ email: '', password: '' });
    const [loginErrors, setLoginErrors] = useState({});
    const [loginBusy, setLoginBusy] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    const onReg = (field) => (e) => {
        setReg((r) => ({ ...r, [field]: e.target.value }));
        setRegErrors((x) => ({ ...x, [field]: undefined, form: undefined }));
    };

    const onLogin = (field) => (e) => {
        setLogin((l) => ({ ...l, [field]: e.target.value }));
        setLoginErrors((x) => ({ ...x, [field]: undefined, form: undefined }));
    };

    const validateRegister = () => {
        const e = {};
        if (!reg.name.trim()) e.name = 'Enter your name';
        if (!reg.email.trim()) e.email = 'Enter your email address';
        else if (!emailLooksValid(reg.email)) e.email = 'That does not look like an email address';
        if (!reg.password) e.password = 'Choose a password';
        else if (reg.password.length < 8) e.password = 'Use at least 8 characters';
        if (reg.phone && !/^[\d+\s()-]{7,}$/.test(reg.phone)) e.phone = 'Check this phone number';
        setRegErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        if (!validateRegister()) return;

        setRegBusy(true);
        try {
            const { data } = await axios.post(`${API_URL}/api/user/register`, {
                name: reg.name.trim(),
                email: reg.email.trim().toLowerCase(),
                phone: reg.phone.trim() || undefined,
                password: reg.password,
            });

            // The register endpoint answers 200 even when the insert fails, so
            // the response body is what decides, not the status code.
            // See REVIEW.md item 2.
            if (!data || !data._id) {
                const duplicate = data?.code === 11000 || /duplicate/i.test(data?.errmsg || data?.message || '');
                setRegErrors({
                    form: duplicate
                        ? 'An account with that email or phone already exists. Sign in instead.'
                        : 'That did not save. Check the details and try again.',
                });
                return;
            }

            toast.success('Account created. Sign in to continue.');
            setLogin({ email: reg.email.trim().toLowerCase(), password: '' });
            setReg({ name: '', email: '', phone: '', password: '' });
            setIsRegisterActive(false);
        } catch (err) {
            setRegErrors({
                form:
                    err.response?.status >= 500
                        ? 'The server is not responding. It may still be waking up, try again in a minute.'
                        : 'That did not save. Check the details and try again.',
            });
        } finally {
            setRegBusy(false);
        }
    };

    const handleLogin = async (event) => {
        event.preventDefault();

        const e = {};
        if (!login.email.trim()) e.email = 'Enter your email address';
        if (!login.password) e.password = 'Enter your password';
        setLoginErrors(e);
        if (Object.keys(e).length) return;

        setLoginBusy(true);
        try {
            const { data } = await axios.post(`${API_URL}/api/user/login`, {
                email: login.email.trim().toLowerCase(),
                password: login.password,
            });

            // One dispatch updates every component at once. The navbar used
            // to wait for its 60-second poll to notice this.
            dispatch(credentialsReceived(data.token, login.email.trim().toLowerCase()));

            const decoded = jwtDecode(data.token);
            toast.success('Signed in');
            navigate(decoded.role === 'admin' ? '/admin' : '/home');
        } catch (err) {
            const status = err.response?.status;
            setLoginErrors({
                form:
                    status === 401
                        ? 'Email or password is not right.'
                        : status >= 500
                        ? 'The server is not responding. It may still be waking up, try again in a minute.'
                        : 'Could not sign you in. Try again.',
            });
        } finally {
            setLoginBusy(false);
        }
    };

    return (
        <div className="auth_page">
            <div className={`container-loginsignup ${isRegisterActive ? 'active' : ''}`} id="container">

                {/* ---------------- register ---------------- */}
                <div className="form-container sign-up">
                    <form onSubmit={handleRegister} noValidate>
                        <h1>Create account</h1>
                        <p className="auth_lede">It takes about thirty seconds.</p>

                        {regErrors.form && <p className="auth_formerror" role="alert">{regErrors.form}</p>}

                        <label className="auth_field">
                            <span>Name</span>
                            <input
                                type="text"
                                value={reg.name}
                                onChange={onReg('name')}
                                autoComplete="name"
                                aria-invalid={Boolean(regErrors.name)}
                            />
                            {regErrors.name && <em>{regErrors.name}</em>}
                        </label>

                        <label className="auth_field">
                            <span>Email</span>
                            <input
                                type="email"
                                value={reg.email}
                                onChange={onReg('email')}
                                autoComplete="email"
                                aria-invalid={Boolean(regErrors.email)}
                            />
                            {regErrors.email && <em>{regErrors.email}</em>}
                        </label>

                        <label className="auth_field">
                            <span>Phone <small>optional</small></span>
                            <input
                                type="tel"
                                value={reg.phone}
                                onChange={onReg('phone')}
                                autoComplete="tel"
                                aria-invalid={Boolean(regErrors.phone)}
                            />
                            {regErrors.phone && <em>{regErrors.phone}</em>}
                        </label>

                        <label className="auth_field">
                            <span>Password</span>
                            <span className="auth_passwrap">
                                <input
                                    type={showRegPassword ? 'text' : 'password'}
                                    value={reg.password}
                                    onChange={onReg('password')}
                                    autoComplete="new-password"
                                    aria-invalid={Boolean(regErrors.password)}
                                />
                                <button
                                    type="button"
                                    className="auth_peek"
                                    onClick={() => setShowRegPassword((v) => !v)}
                                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                                >
                                    <i className={`bi ${showRegPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true"></i>
                                </button>
                            </span>
                            {regErrors.password
                                ? <em>{regErrors.password}</em>
                                : <small className="auth_hint">At least 8 characters</small>}
                        </label>

                        <button type="submit" disabled={regBusy}>
                            {regBusy ? 'Creating account...' : 'Create account'}
                        </button>

                        <p className="auth_switch">
                            Already have an account?{' '}
                            <button type="button" onClick={() => setIsRegisterActive(false)}>Sign in</button>
                        </p>
                    </form>
                </div>

                {/* ---------------- sign in ---------------- */}
                <div className="form-container sign-in">
                    <form onSubmit={handleLogin} noValidate>
                        <h1>Sign in</h1>
                        <p className="auth_lede">Welcome back.</p>

                        {loginErrors.form && <p className="auth_formerror" role="alert">{loginErrors.form}</p>}

                        <label className="auth_field">
                            <span>Email</span>
                            <input
                                type="email"
                                value={login.email}
                                onChange={onLogin('email')}
                                autoComplete="email"
                                aria-invalid={Boolean(loginErrors.email)}
                            />
                            {loginErrors.email && <em>{loginErrors.email}</em>}
                        </label>

                        <label className="auth_field">
                            <span>Password</span>
                            <span className="auth_passwrap">
                                <input
                                    type={showLoginPassword ? 'text' : 'password'}
                                    value={login.password}
                                    onChange={onLogin('password')}
                                    autoComplete="current-password"
                                    aria-invalid={Boolean(loginErrors.password)}
                                />
                                <button
                                    type="button"
                                    className="auth_peek"
                                    onClick={() => setShowLoginPassword((v) => !v)}
                                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                                >
                                    <i className={`bi ${showLoginPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true"></i>
                                </button>
                            </span>
                            {loginErrors.password && <em>{loginErrors.password}</em>}
                        </label>

                        <NavLink to="/enter-email" className="auth_forgot">Forgotten your password?</NavLink>

                        <button type="submit" disabled={loginBusy}>
                            {loginBusy ? 'Signing in...' : 'Sign in'}
                        </button>

                        <p className="auth_switch">
                            New here?{' '}
                            <button type="button" onClick={() => setIsRegisterActive(true)}>Create an account</button>
                        </p>
                    </form>
                </div>

                {/* ---------------- sliding panel (desktop only) ---------------- */}
                <div className="toggle-container" aria-hidden="true">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <h2>Already with us?</h2>
                            <p>Sign in to reach your cart, saved items and order history.</p>
                            <button className="hidden" type="button" onClick={() => setIsRegisterActive(false)}>
                                Sign in
                            </button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h2>New to DeviceDepot?</h2>
                            <p>Create an account to save items, track orders and check out faster.</p>
                            <button className="hidden" type="button" onClick={() => setIsRegisterActive(true)}>
                                Create account
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default LoginRegisterPage;
