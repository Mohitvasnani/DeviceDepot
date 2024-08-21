import React, { useState } from 'react';
import '../css/register.css';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Correct import statement
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginRegisterPage() {
    const [isRegisterActive, setIsRegisterActive] = useState(false);

    const handleRegisterClick = () => {
        setIsRegisterActive(true);
    };

    const handleLoginClick = () => {
        setIsRegisterActive(false);
    };

    // State variables for registration form
    const [isName, setName] = useState('');
    const [isEmail, setEmail] = useState('');
    const [isNumber, setNumber] = useState('');
    const [isPassword, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');

    // Regular expression for basic email validation
    const validateEmail = (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const handleSubmitRegister = (e) => {
        e.preventDefault();

        // Validate email
        if (!validateEmail(isEmail)) {
            setEmailError('Please enter a valid email address.');
            return;
        }

        // Reset email error if previously set
        setEmailError('');

        const formData = { name: isName, email: isEmail, phone: isNumber, password: isPassword };

        axios.post('http://localhost:8080/api/user/register', formData, { withCredentials: true })
            .then(result => {
                toast.success('Registration successful!');
                console.log(result);
            })
            .catch(err => {
                toast.error('Registration failed. Please try again.');
                console.log(err);
            });
    };

    // State variables for login form
    const [isLoginEmail, setLoginEmail] = useState('');
    const [isLoginPassword, setLoginPassword] = useState('');

    const navigate = useNavigate();

    axios.defaults.withCredentials = true;

    const handleLogin = (e) => {
        e.preventDefault();
        axios.post("http://localhost:8080/api/user/login", { email: isLoginEmail, password: isLoginPassword }, { withCredentials: true })
            .then(response => {
                const { token } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('email', isLoginEmail);
                console.log(response);
                const decodedToken = jwtDecode(token);

                toast.success('Login successful!');

                if (decodedToken.role === 'admin') {
                    navigate('/admin/*');
                } else if (decodedToken.role === 'user') {
                    navigate('/home');
                } else {
                    console.error('Invalid role received from server');
                }
            })
            .catch(error => {
                if (error.response && error.response.status === 401) {
                    toast.error('Invalid credentials');
                    console.error('Invalid credentials');
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
                        {/* <div className="social-icons">
                            <a href="#" className="icon"><i className="fa-brands fa-google-plus-g"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-linkedin-in"></i></a>
                        </div> */}
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
                        {/* <div className="social-icons">
                            <a href="#" className="icon"><i className="fa-brands fa-google-plus-g"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-linkedin-in"></i></a>
                        </div> */}
                        <span>or use your email for password</span>
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
