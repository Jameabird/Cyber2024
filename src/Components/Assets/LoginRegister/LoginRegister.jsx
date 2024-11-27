import React, { useState } from 'react';
import './LoginRegister.css';
import { FaUserFriends, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdMarkEmailRead, MdOutlineMailLock } from "react-icons/md";
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';

const LoginRegister = ({ setIsAuthenticated }) => { // รับ setIsAuthenticated จาก props
    const [isRegistering, setIsRegistering] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false); 

    const navigate = useNavigate(); 

    const registerLink = () => {
        setIsRegistering(true);
        setIsForgotPassword(false);
    };

    const loginLink = () => {
        setIsRegistering(false);
        setIsForgotPassword(false);
    };

    const forgotPasswordLink = () => {
        setIsForgotPassword(true);
        setIsRegistering(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault(); 
        try {
            const response = await axios.post('http://127.0.0.1:5000/login', { 
                username: loginData.username, 
                password: loginData.password 
            });
            console.log(response.data); 
            alert("Login successful");
            setIsAuthenticated(true); // ตั้งค่าสถานะล็อกอินเป็น true
            navigate('/Welcome'); 
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Login failed. Please check your credentials.');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault(); 
        if (registerData.password !== registerData.confirmPassword) { 
            alert('Passwords do not match');
            return;
        }
        try {
            const response = await axios.post('http://127.0.0.1:5000/register', { 
                username: registerData.username, 
                email: registerData.email, 
                password: registerData.password 
            });
            console.log(response.data); 
            alert("Registration successful");
        
            setRegisterData({ username: '', email: '', password: '', confirmPassword: '' }); 
            setIsRegistering(false); 
            setIsForgotPassword(false); 
            navigate('/');
        } catch (error) {
            if (error.response) {
                console.error('Error registering:', error.response.data);
                alert("Registration failed: " + error.response.data.message);
            } else {
                console.error('Error registering:', error.message);
                alert("Registration failed: " + error.message);
            }
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5000/forget', { 
                email: forgotPasswordEmail 
            });
            console.log(response.data); 
            alert("Password reset link sent to your email");
            navigate('PasswordReset');
            
        } catch (error) {
            console.error('Error sending reset link:', error);
            alert('Failed to send reset link. Please try again.');
        }
    };

    return (
        <div className={`wrapper${isRegistering ? ' active' : isForgotPassword ? ' active-forgot' : ''}`}>
            {!isForgotPassword && !isRegistering && (
                <div className="form-box login active">
                    <form onSubmit={handleLogin}>
                        <h1>Login</h1>
                        <div className="input-box">
                            <input 
                                type="text" 
                                placeholder="Username" 
                                required 
                                value={loginData.username}
                                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                            />
                            <FaUserFriends className="icon" />
                        </div>
                        <div className="input-box">
                            <input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Password" 
                                required 
                                value={loginData.password}
                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            />
                            <span className="icon" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        <div className="remember-forgot">
                            <label><input type="checkbox" /> Remember me</label>
                            <a href="#" onClick={forgotPasswordLink}>Forgot password</a>
                        </div>

                        <button type="submit">Login</button>

                        <div className="register-link">
                            <p>Don't have an account? <a href="#" onClick={registerLink}>Register</a></p>
                        </div>
                    </form>
                </div>
            )}

            {isForgotPassword && (
                <div className="form-box forgot-password active">
                    <form onSubmit={handleForgotPassword}>
                        <h1>Forgot your password</h1>
                        <div className="input-box">
                            <input 
                                type="email" 
                                placeholder="Enter email address" 
                                required 
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            />
                            <MdOutlineMailLock className="icon" />
                        </div>
                        <button type="submit">Request reset link</button>

                        <div className="register-link">
                            <p>Back to <a href="#" onClick={loginLink}>Login</a></p>
                        </div>
                    </form>
                </div>
            )}

            {isRegistering && (
                <div className="form-box register active">
                    <form onSubmit={handleRegister}>
                        <h1>Registration</h1>
                        <div className="input-box">
                            <input 
                                type="text" 
                                placeholder="Username" 
                                required 
                                value={registerData.username}
                                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                            />
                            <FaUserFriends className="icon" />
                        </div>
                        <div className="input-box">
                            <input 
                                type="email" 
                                placeholder="Email" 
                                required 
                                value={registerData.email}
                                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            />
                            <MdMarkEmailRead className="icon" />
                        </div>
                        <div className="input-box">
                            <input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Password" 
                                required 
                                value={registerData.password}
                                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            />
                            <span className="icon" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <div className="input-box">
                            <input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm Password" 
                                required 
                                value={registerData.confirmPassword}
                                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                            />
                            <span className="icon" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        <div className="remember-forgot">
                            <label><input type="checkbox" /> I agree to the terms & conditions</label>
                        </div>

                        <button type="submit">Register</button>

                        <div className="register-link">
                            <p>Already have an account? <a href="#" onClick={loginLink}>Login</a></p>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LoginRegister;
