import React, { useState } from 'react';
import '../css/register.css';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL;

function LoginRegisterPage() {
    const [isRegisterActive, setIsRegisterActive] = useState(false);
    const [isName, setName] = useState('');
    const [isEmail, setEmail] = useState('');
    const [isNumber, setNumber] = useState('');
    const [isPassword, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoginEmail, setLoginEmail] = useState('');
    const [isLoginPassword, setLoginPassword] = useState('');

    const navigate = useNavigate();

    const handleRegisterClick = () => setIsRegisterActive(true);
    const handleLoginClick = () => setIsRegisterActive(false);

    const validateEmail = (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const handleSubmitRegister = (e) => {
        e.preventDefault();

        if (!validateEmail(isEmail)) {
            setEmailError('Please enter a valid email address.');
            return;
        }
        setEmailError('');

        const formData = { 
            name: isName, 
            email: isEmail, 
            phone: isNumber, 
            password: isPassword 
        };

        axios.post(`${API_URL}/api/user/register`, formData)
            .then(result => {
                toast.success('Registration successful! Please sign in.');
                setIsRegisterActive(false);
                console.log(result);
            })
            .catch(err => {
                toast.error('Registration failed. Please try again.');
                console.log(err);
            });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        axios.post(`${API_URL}/api/user/login`, { 
            email: isLoginEmail, 
            password: isLoginPassword 
        })
            .then(response => {
                const { token } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('email', isLoginEmail);

                const decodedToken = jwtDecode(token);
                toast.success('Login successful!');

                if (decodedToken.role === 'admin') {
                    navigate('/admin');   
                } else {
                    navigate('/home');
                }
            })
            .catch(error => {
                if (error.response && error.response.status === 401) {
                    toast.error('Invalid email or password');
                } else {
                    toast.error('Error during login. Please try again.');
                    console.error('Error during login:', error.message);
                }
            });
    };

    return (
        <div className="parent_cont_regform d-flex justify-content-center align-content-center p-5" style={{ minHeight: '100vh', width: '100%' }}>
            <ToastContainer />
            <div className={`container container-loginsignup ${isRegisterActive ? 'active' : ''}`} id="container">
                <div className="form-container sign-up">
                    <form onSubmit={handleSubmitRegister}>
                        <h1>Create Account</h1>
                        <span>or use your email for registration</span>
                        <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} />
                        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                        {emailError && <p className="error">{emailError}</p>}
                        <input type="number" placeholder="Phone" onChange={(e) => setNumber(e.target.value)} />
                        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                        <button type="submit">Sign Up</button>
                    </form>
                </div>
                <div className="form-container sign-in">
                    <form onSubmit={handleLogin}>
                        <h1>Sign In</h1>
                        <span>or use your email password</span>
                        <input type="email" placeholder="Email" onChange={(e) => setLoginEmail(e.target.value)} />
                        <input type="password" placeholder="Password" onChange={(e) => setLoginPassword(e.target.value)} />
                        <NavLink to={'/enter-email'}>Forget Your Password?</NavLink>
                        <button type="submit">Sign In</button>
                    </form>
                </div>
                <div className="toggle-container">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <h1>Welcome Back!</h1>
                            <p>Enter your personal details to use all site features</p>
                            <button className="hidden" id="login" onClick={handleLoginClick}>Sign In</button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h1>Hello, Friend!</h1>
                            <p>Register with your personal details to use all site features</p>
                            <button className="hidden" id="register" onClick={handleRegisterClick}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginRegisterPage;