import React, { useState } from 'react';
import './ChangePassword.css'; // Make sure to style this appropriately
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PasswordChange = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const navigate = useNavigate();

    const handleChangePassword = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        try {
            // Send old password and new password to the backend
            const response = await axios.post('http://127.0.0.1:5000/reset_pass', {
                oldPassword,
                newPassword,
            });

            console.log(response.data);
            alert("Password change successful");
            navigate('/Welcome'); // Redirect back to login page
        } catch (error) {
            console.error('Error changing password:', error);
            alert('Failed to change password. Please try again.');
        }
    };

    const handleCancel = () => {
        navigate('/Welcome'); // Redirect back to login page
    };

    return (
        <div className="password-change-container">
            <div className="wrapper2">
                <form onSubmit={handleChangePassword}>
                    <h2>Change Password</h2>
                    <div className="input-box">
                        <input 
                            type={showOldPassword ? "text" : "password"}
                            placeholder="Old Password" 
                            required 
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <span className="icon" onClick={() => setShowOldPassword(!showOldPassword)}>
                            {showOldPassword ? (
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
                            type={showNewPassword ? "text" : "password"}
                            placeholder="New Password" 
                            required 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <span className="icon" onClick={() => setShowNewPassword(!showNewPassword)}>
                            {showNewPassword ? (
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
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Confirm New Password" 
                            required 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <span className="icon" onClick={() => setShowNewPassword(!showNewPassword)}>
                            {showNewPassword ? (
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
                    <div className="button-container">
                        <button type="submit" className="confirm-button">Confirm</button>
                        <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordChange;
