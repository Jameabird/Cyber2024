import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Welcome.css';

const Welcome = () => {
    const navigate = useNavigate(); // เพิ่มการนำทาง
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordExpiryWarning, setPasswordExpiryWarning] = useState('');

    const toggleOldPasswordVisibility = () => setShowOldPassword(!showOldPassword);
    const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            alert("New passwords do not match");
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:5000/reset_pass', {
                oldPassword,
                newPassword,
            });

            if (!response.data.success) {
                alert("Password changed successfully!");

                // เมื่อสำเร็จ กลับไปยังหน้า Welcome
                navigate('/Welcome');
            } else {
                alert("Error changing password: " + response.data.message);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while changing the password.");
        }
    };

    const resetForm = () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsChangingPassword(false);
    };

    const checkPasswordExpiry = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/check');

            if (!response.data.expired) {
                const userConfirmed = window.confirm("Your password will expire soon. Please change it.");

                // ถ้าผู้ใช้กด OK จะนำทางไปหน้า ChangePassword
                if (userConfirmed) {
                    navigate('/ChangePassword');
                }
            } else {
                setPasswordExpiryWarning('');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        alert("Logged out successfully!");
        navigate('/'); // ใช้ navigate แทน window.location.href
    };

    useEffect(() => {
        checkPasswordExpiry();
    }, []);

    return (
        <div className="welcome-container">
            <header className="welcome-header">
                <h1>Welcome to the Website!</h1>
                <p>Cyber Security</p>
                {passwordExpiryWarning && <div className="expiry-warning">{passwordExpiryWarning}</div>}
                <div className="button-container">
                    <button className="change-password-btn" onClick={() => setIsChangingPassword(!isChangingPassword)}>
                        Change Password
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            {isChangingPassword && (
                <div className="change-password-form">
                    <h2>Change Password</h2>
                    <form onSubmit={handleChangePassword}>
                        <div className="input-group">
                            <input 
                                type={showOldPassword ? "text" : "password"}
                                value={oldPassword} 
                                onChange={(e) => setOldPassword(e.target.value)} 
                                placeholder="Old Password"
                                required 
                            />
                            <span className="icon" onClick={toggleOldPasswordVisibility}>
                                {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <div className="input-group">
                            <input 
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                placeholder="New Password"
                                required 
                            />
                            <span className="icon" onClick={toggleNewPasswordVisibility}>
                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <div className="input-group">
                            <input 
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                placeholder="Confirm New Password"
                                required 
                            />
                            <span className="icon" onClick={toggleConfirmPasswordVisibility}>
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <button type="submit">Submit</button>
                        <button type="button" onClick={resetForm}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Welcome;
