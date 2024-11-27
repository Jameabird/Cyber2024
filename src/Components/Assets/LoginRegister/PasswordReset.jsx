import React, { useState } from 'react';
import './PasswordReset.css'; // Make sure to style this appropriately
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PasswordReset = () => {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        // Check password length or complexity if necessary
        if (newPassword.length < 8) {
            alert('Password must be at least 8 characters long.');
            return;
        }

        try {
            // Send token and new password to the backend
            const response = await axios.post('http://127.0.0.1:5000/forget_password', {
                token,
                password: newPassword,
            });

            console.log(response.data);
            alert("Password reset successful");
            navigate('/'); // Redirect back to login page
        } catch (error) {
            console.error('Error resetting password:', error);
            alert('Failed to reset password. Please check the token and try again.');
        }
    };

    const handleCancel = () => {
        navigate('/'); // Redirect back to login page
    };

    return (
        <div className="password-reset-container">
            <form onSubmit={handleReset}>
                <h1>Reset Password</h1>
                <div className="input-box">
                    <input 
                        type="text" 
                        placeholder="Enter your token" 
                        required 
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                </div>
                <div className="input-box">
                    <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password" 
                        required 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <span className="icon" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.965 10.965 0 0012 21c-5.523 0-10-4.477-10-10 0-1.925.525-3.725 1.425-5.25m4.95 3.975a2.75 2.75 0 113.85-3.85m3.675 8.775a10.965 10.965 0 001.425-5.25c0-1.925-.525-3.725-1.425-5.25m-4.95 3.975a2.75 2.75 0 01-3.85 3.85"/>
                            </svg>
                        ) : (
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12c2.5-4 6.5-7 9-7s6.5 3 9 7-2.5 7-9 7-6.5-3-9-7zM12 12a2 2 0 100-4 2 2 0 000 4z"/>
                            </svg>
                        )}
                    </span>
                </div>
                <div className="input-box">
                    <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm New Password" 
                        required 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <span className="icon" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.965 10.965 0 0012 21c-5.523 0-10-4.477-10-10 0-1.925.525-3.725 1.425-5.25m4.95 3.975a2.75 2.75 0 113.85-3.85m3.675 8.775a10.965 10.965 0 001.425-5.25c0-1.925-.525-3.725-1.425-5.25m-4.95 3.975a2.75 2.75 0 01-3.85 3.85"/>
                            </svg>
                        ) : (
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12c2.5-4 6.5-7 9-7s6.5 3 9 7-2.5 7-9 7-6.5-3-9-7zM12 12a2 2 0 100-4 2 2 0 000 4z"/>
                            </svg>
                        )}
                    </span>
                </div>
                <button type="submit">Confirm</button>
                <button type="button" onClick={handleCancel}>Cancel</button>
            </form>
        </div>
    );
};
export default PasswordReset;