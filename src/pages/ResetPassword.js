import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import '../styles/Signin.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract token from URL
    const params = new URLSearchParams(location.search);
    const resetToken = params.get('token');
    
    if (!resetToken) {
      setIsLoading(false);
      Swal.fire({
        title: 'Invalid Request',
        text: 'No reset token provided',
        icon: 'error',
        background: 'rgba(16, 16, 28, 0.95)',
        confirmButtonColor: '#00A951',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          content: 'swal-custom-content'
        }
      }).then(() => {
        navigate('/signin');
      });
      return;
    }
    
    setToken(resetToken);
    
    // Verify token
    const verifyToken = async () => {
      try {
        const response = await fetch(`${API_URL}api/auth/reset-password?token=${resetToken}`);
        const data = await response.json();
        
        if (response.ok && data.valid) {
          setIsValidToken(true);
        } else {
          Swal.fire({
            title: 'Invalid Token',
            text: 'Your password reset link is invalid or has expired',
            icon: 'error',
            background: 'rgba(16, 16, 28, 0.95)',
            confirmButtonColor: '#00A951',
            customClass: {
              popup: 'swal-custom-popup',
              title: 'swal-custom-title',
              content: 'swal-custom-content'
            }
          }).then(() => {
            navigate('/signin');
          });
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to verify your reset token. Please try again later.',
          icon: 'error',
          background: 'rgba(16, 16, 28, 0.95)',
          confirmButtonColor: '#00A951',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content'
          }
        }).then(() => {
          navigate('/signin');
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyToken();
  }, [location.search, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validate password
    if (password.length < 7) {
      Swal.fire({
        title: 'Password Too Short',
        text: 'Password must be at least 7 characters long',
        icon: 'error',
        background: 'rgba(16, 16, 28, 0.95)',
        confirmButtonColor: '#00A951',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          content: 'swal-custom-content'
        }
      });
      return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      Swal.fire({
        title: 'Passwords Don\'t Match',
        text: 'Please make sure your passwords match',
        icon: 'error',
        background: 'rgba(16, 16, 28, 0.95)',
        confirmButtonColor: '#00A951',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          content: 'swal-custom-content'
        }
      });
      return;
    }
    
    try {
      // Show loading state
      Swal.fire({
        title: 'Resetting Password...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        background: 'rgba(16, 16, 28, 0.95)',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          content: 'swal-custom-content'
        }
      });
      
      // Send reset request
      const response = await fetch(`${API_URL}api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Swal.fire({
          title: 'PASSWORD RESET!',
          html: `
            <div style="text-align: center; color: #00ff84; margin-bottom: 20px;">
              Your password has been successfully reset.<br>
              You can now sign in with your new password.
            </div>
          `,
          icon: 'success',
          background: 'rgba(16, 16, 28, 0.95)',
          confirmButtonColor: '#00A951',
          confirmButtonText: 'OK',
          showCancelButton: true,
          cancelButtonText: 'CANCEL',
          cancelButtonColor: '#d33',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content',
            icon: 'swal-custom-icon',
            confirmButton: 'swal-custom-confirm-button',
            cancelButton: 'swal-custom-cancel-button'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            // Redirect to sign in WITHOUT any query parameter
            navigate('/signin');
          }
        });
      } else {
        // Show error if new password is the same as old password or any other error
        Swal.fire({
          title: 'RESET FAILED',
          html: `<div style="text-align: center; color: #ff4444; margin-bottom: 20px;">${data.message || 'Failed to reset your password. Please try again later.'}</div>`,
          icon: 'error',
          background: 'rgba(16, 16, 28, 0.95)',
          confirmButtonColor: '#00A951',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content',
            icon: 'swal-custom-icon',
            confirmButton: 'swal-custom-confirm-button'
          }
        });
        throw new Error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to reset your password. Please try again later.',
        icon: 'error',
        background: 'rgba(16, 16, 28, 0.95)',
        confirmButtonColor: '#00A951',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          content: 'swal-custom-content'
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="signin-container">
        <div className="signin-card">
          <div className="signin-header">
            <h1 className="signin-title">TrackTechFit</h1>
            <p className="signin-subtitle">Reset Password</p>
          </div>
          <div className="verification-content">
            <div className="verification-loader"></div>
            <div className="verification-message">
              <p>Verifying your reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="signin-container">
        <div className="signin-card">
          <div className="signin-header">
            <h1 className="signin-title">TrackTechFit</h1>
            <p className="signin-subtitle">Reset Password</p>
          </div>
          <div className="verification-content">
            <div className="verification-message error">
              <p>Invalid or expired reset link.</p>
              <button 
                className="signin-button" 
                onClick={() => navigate('/signin')}
                style={{ marginTop: '20px' }}
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-header">
          <h1 className="signin-title">TrackTechFit</h1>
          <p className="signin-subtitle">Reset Password</p>
        </div>
        <form className="signin-form" onSubmit={handleResetPassword}>
          <div className="signin-input-container">
            <FaLock size={24} className="signin-input-icon" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="New Password" 
              className="signin-input"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={7}
            />
            <div 
              className="signin-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FaEye size={24} className="signin-password-icon" />
              ) : (
                <FaEyeSlash size={24} className="signin-password-icon" />
              )}
            </div>
          </div>
          
          <div className="signin-input-container">
            <FaLock size={24} className="signin-input-icon" />
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="Confirm New Password" 
              className="signin-input"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              minLength={7}
            />
            <div 
              className="signin-password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <FaEye size={24} className="signin-password-icon" />
              ) : (
                <FaEyeSlash size={24} className="signin-password-icon" />
              )}
            </div>
          </div>
          
          <button type="submit" className="signin-button">
            RESET PASSWORD
          </button>
        </form>
        <div className="signin-signup-link">
          <p>Remember your password? <a href="/signin">Sign In</a></p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword; 