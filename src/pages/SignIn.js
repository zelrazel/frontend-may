import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import '../styles/Signin.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check for verification success parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const verified = queryParams.get('verified');
    
    if (verified === 'true') {
      Swal.fire({
        title: 'Email Verified!',
        text: 'Your account has been successfully verified. You can now sign in.',
        icon: 'success',
        background: 'rgba(16, 16, 28, 0.95)',
        confirmButtonColor: '#00A951',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          content: 'swal-custom-content',
          icon: 'swal-custom-icon'
        },
        didOpen: () => {
          Swal.getIcon().style.animation = 'none';
          Swal.getIcon().style.border = 'none';
          Swal.getIcon().style.backgroundColor = 'transparent';
        }
      });
      
      // Clean up the URL by removing the query parameter
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    const resetSuccess = queryParams.get('resetSuccess');
    if (resetSuccess === 'true') {
      Swal.fire({
        title: 'Password Reset!',
        text: 'Your password has been successfully reset. You can now sign in with your new password.',
        icon: 'success',
        background: 'rgba(16, 16, 28, 0.95)',
        confirmButtonColor: '#00A951',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          content: 'swal-custom-content',
          icon: 'swal-custom-icon'
        }
      });
      
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`${API_URL}api/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
            mode: 'cors'
        });
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Dispatch a custom event to notify all components about the authentication change
            window.dispatchEvent(new CustomEvent('auth-change', { 
                detail: { status: 'signed-in', user: data.user } 
            }));
            
            // Show success animation
            await Swal.fire({
                title: 'Welcome!',
                text: 'Successfully signed in',
                icon: 'success',
                showConfirmButton: false,
                timer: 2000,
                background: 'rgba(16, 16, 28, 0.95)',
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title',
                    content: 'swal-custom-content',
                    icon: 'swal-custom-icon'
                },
                didOpen: () => {
                    Swal.getIcon().style.animation = 'none';
                    Swal.getIcon().style.border = 'none';
                    Swal.getIcon().style.backgroundColor = 'transparent';
                }
            });

            navigate('/');
        } else {
            Swal.fire({
                title: 'Sign In Failed',
                text: data.error === 'Please verify your email before signing in.' 
                    ? 'Please check your email and verify your account before signing in.' 
                    : (data.error || 'Invalid credentials'),
                icon: 'error',
                background: 'rgba(16, 16, 28, 0.95)',
                confirmButtonColor: '#00ff84',
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title',
                    content: 'swal-custom-content'
                }
            });
        }
    } catch (error) {
        console.error('Login failed:', error);
        Swal.fire({
            title: 'Error',
            text: 'An unexpected error occurred',
            icon: 'error',
            background: 'rgba(16, 16, 28, 0.95)',
            confirmButtonColor: '#00ff84',
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title',
                content: 'swal-custom-content'
            }
        });
    }
  };

  const handleForgotPassword = async () => {
    // Show a dialog to enter email
    const { value: email, isConfirmed } = await Swal.fire({
      title: 'Reset Password',
      input: 'email',
      inputLabel: 'Enter your email address',
      inputPlaceholder: 'name@example.com',
      background: 'rgba(16, 16, 28, 0.95)',
      confirmButtonColor: '#00A951',
      showCancelButton: true,
      cancelButtonColor: '#d33',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter your email address!';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
      },
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        content: 'swal-custom-content',
        input: 'swal-custom-input'
      }
    });

    if (isConfirmed && email) {
      try {
        Swal.fire({
          title: 'Sending Email...',
          text: 'Please wait while we process your request',
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

        // Send reset password request
        const response = await fetch(`${API_URL}api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const data = await response.json();
        
        if (response.ok) {
          Swal.fire({
            title: 'EMAIL SENT!',
            html: `
              <div style="text-align: center; color: #00ff84; margin-bottom: 20px;">
                We've sent password reset instructions to your email.
              </div>
              <div style="margin: 25px auto; padding: 15px; background-color: rgba(0, 95, 45, 0.5); 
                  border: 1px solid #00ff84; border-radius: 10px; max-width: 90%;">
                <span style="color: #00ff84; font-weight: bold; font-size: 18px; display: inline-block;">
                  ⚠️ IMPORTANT:
                </span>
                <div style="margin-top: 5px; color: #ffffff; text-align: center;">
                  If you don't see the email in your inbox,<br>
                  <span style="font-weight: bold; color: #ffffff; font-size: 16px;">
                    CHECK YOUR SPAM/JUNK FOLDER
                  </span>
                </div>
              </div>
            `,
            icon: 'success',
            background: 'rgba(16, 16, 28, 0.95)',
            confirmButtonColor: '#00A951',
            confirmButtonText: 'OK',
            showCancelButton: true,
            cancelButtonColor: '#d33',
            cancelButtonText: 'CANCEL',
            customClass: {
              popup: 'swal-custom-popup',
              title: 'swal-custom-title',
              content: 'swal-custom-content',
              icon: 'swal-custom-icon',
              confirmButton: 'swal-custom-confirm-button',
              cancelButton: 'swal-custom-cancel-button'
            }
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: data.message || 'Failed to send reset email. Please try again.',
            icon: 'error',
            background: 'rgba(16, 16, 28, 0.95)',
            confirmButtonColor: '#00ff84',
            customClass: {
              popup: 'swal-custom-popup',
              title: 'swal-custom-title',
              content: 'swal-custom-content'
            }
          });
        }
      } catch (error) {
        console.error('Reset password request failed:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to send reset email. Please try again later.',
          icon: 'error',
          background: 'rgba(16, 16, 28, 0.95)',
          confirmButtonColor: '#00ff84',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content'
          }
        });
      }
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-header">
          <h1 className="signin-title">TrackTechFit</h1>
          <p className="signin-subtitle">Train Hard, Stay Consistent</p>
        </div>
        <form className="signin-form" onSubmit={handleSignIn}>
          <div className="signin-input-container">
            <FaEnvelope size={24} className="signin-input-icon" />
            <input 
              type="email" 
              placeholder="Email" 
              className="signin-input"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="signin-input-container">
            <FaLock size={24} className="signin-input-icon" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="signin-input"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
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
          
          <button type="submit" className="signin-button">
            SIGN IN
          </button>
        </form>
        <div className="signin-signup-link">
          <p>Don't have an account? <a href="/signup">Sign Up</a></p>
        </div>
        <div className="forgot-password-link">
          <span onClick={handleForgotPassword}>Forgot password?</span>
        </div>
      </div>
    </div>
  );
}

export default SignIn;