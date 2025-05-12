import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBicycle, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaArrowRight, FaRuler, FaWeight, FaVenusMars, FaBirthdayCake, FaPhone } from 'react-icons/fa';
import Swal from 'sweetalert2';
import '../styles/Signup.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [course, setCourse] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+639');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [ageError, setAgeError] = useState('');
  const [heightError, setHeightError] = useState('');
  const [weightError, setWeightError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [phoneAvailable, setPhoneAvailable] = useState(false);
  const navigate = useNavigate();

  const formatPhoneNumber = (input) => {
    // Remove all non-digit characters
    const numbers = input.replace(/\D/g, '');
    
    // If it starts with 0, replace it with +63
    if (numbers.startsWith('0')) {
      return '+63' + numbers.slice(1);
    }
    
    // If it doesn't start with +63, add it
    if (!numbers.startsWith('63')) {
      return '+63' + numbers;
    }
    
    return '+' + numbers;
  };

  const validatePhoneNumber = (number) => {
    return /^\+639\d{9}$/.test(number);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.com$/.test(email);
  };

  const validatePassword = (password) => {
    if (password.length < 7) {
      setPasswordError('Password must be at least 7 characters');
      return false;
    } else if (password.length > 20) {
      setPasswordError('Password cannot exceed 20 characters');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  // Check if email is already registered
  const checkExistingEmail = async (email) => {
    if (!validateEmail(email)) return;
    
    setIsCheckingEmail(true);
    setEmailAvailable(false); // Reset available status while checking
    
    try {
      // Add artificial delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await fetch(`${API_URL}api/auth/check-email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.exists) {
        setEmailError('This email is already taken');
        setEmailAvailable(false);
        return true;
      } else {
        setEmailAvailable(true); // Email is available
        return false;
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailAvailable(false);
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Check if phone number is already registered
  const checkExistingPhone = async (phone) => {
    if (!validatePhoneNumber(phone)) return;
    
    setIsCheckingPhone(true);
    setPhoneAvailable(false); // Reset available status while checking
    
    try {
      // Add artificial delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await fetch(`${API_URL}api/auth/check-phone?phone=${encodeURIComponent(phone)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.exists) {
        setPhoneError('Phone number is already registered');
        setPhoneAvailable(false);
        return true;
      } else {
        setPhoneAvailable(true); // Phone is available
        return false;
      }
    } catch (error) {
      console.error('Error checking phone:', error);
      setPhoneAvailable(false);
      return false;
    } finally {
      setIsCheckingPhone(false);
    }
  };

  // Validate that name only contains letters and spaces
  const validateName = (name) => {
    return /^[A-Za-z\s]+$/.test(name);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Final validation before submission
    const emailExists = await checkExistingEmail(email);
    const phoneExists = await checkExistingPhone(phoneNumber);
    const isPasswordValid = validatePassword(password);
    
    if (emailExists || phoneExists || !isPasswordValid) {
      return; // Stop form submission if validation fails
    }

    try {
        const response = await fetch(`${API_URL}api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                firstName, 
                lastName, 
                email, 
                password,
                course,
                height: parseFloat(height),
                weight: parseFloat(weight),
                gender,
                age: parseInt(age),
                phoneNumber
            })
        });

        if (response.ok) {
            const data = await response.json();
            
            // Customize message based on response
            let title = 'REGISTRATION SUCCESSFUL!';
            let mainMessage = data.autoVerified 
                ? 'Your account has been verified. You can now sign in.'
                : 'Please check your email to verify your account before signing in.';
                
            if (!data.emailSent && !data.autoVerified) {
                mainMessage = 'Account created but verification email could not be sent. Please contact support.';
            }

            // Create HTML content with larger, more prominent text
            const htmlContent = `
                <div style="font-family: 'Arial', sans-serif; color: #00ff84; text-align: center;">
                    <div style="font-size: 20px; margin-bottom: 20px;">
                        ${mainMessage}
                    </div>
                    ${data.emailSent ? `
                    <div style="margin: 25px auto; padding: 15px; background-color: rgba(0, 255, 132, 0.1); 
                        border: 2px solid #00ff84; border-radius: 10px; max-width: 90%;">
                        <span style="font-size: 18px; color: #00ff84; font-weight: bold;">
                            ⚠️ IMPORTANT: 
                        </span>
                        <div style="font-size: 16px; margin-top: 10px; color: #ffffff;">
                            If you don't see the verification email in your inbox,<br>
                            <span style="font-weight: bold; font-size: 18px;">CHECK YOUR SPAM/JUNK FOLDER</span>
                        </div>
                    </div>` : ''}
                </div>
            `;
            
            // Show success animation
            await Swal.fire({
                title: title,
                html: htmlContent,
                icon: 'success',
                showConfirmButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: '#00A951',
                background: 'rgba(16, 16, 28, 0.95)',
                width: 600,
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title',
                    content: 'swal-custom-content',
                    icon: 'swal-custom-icon',
                    confirmButton: 'swal-custom-confirm-button'
                },
                didOpen: () => {
                    // Add custom animation for the success icon
                    Swal.getIcon().style.animation = 'none';
                    Swal.getIcon().style.border = 'none';
                    Swal.getIcon().style.backgroundColor = 'transparent';
                }
            });
            
            // Navigate to signin page after animation
            navigate('/signin');
        } else {
            const data = await response.json();
            Swal.fire({
                title: 'Registration Failed',
                text: data.message || 'Sign up failed',
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
        console.error('Sign up error:', error);
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

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1 className="signup-title">TrackTechFit</h1>
          <p className="signup-subtitle">Join the Community</p>
        </div>
        
        <form className="signup-form" onSubmit={handleSignUp}>
        <div className={`signup-input-container ${emailError ? 'error-container' : emailAvailable && email ? 'success-container' : ''}`}>
            <FaEnvelope className="signup-input-icon" />
            <input
                type="email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailAvailable(false);
                    if (!validateEmail(e.target.value)) {
                        setEmailError('Please enter a valid email');
                    } else {
                        setEmailError('');
                        // Check if email exists after a short delay (debounce)
                        const timer = setTimeout(() => {
                          checkExistingEmail(e.target.value);
                        }, 500);
                        return () => clearTimeout(timer);
                    }
                }}
                onBlur={() => {
                    if (validateEmail(email)) {
                        checkExistingEmail(email);
                    }
                }}
                placeholder="Email"
                className={`signup-input ${emailError ? 'error' : ''}`}
                required
            />
            {isCheckingEmail && <div className="loader-container"><div className="loader"></div></div>}
            {emailAvailable && !isCheckingEmail && email && <div className="success-indicator"></div>}
        </div>
        {emailError && <div className="error-message">{emailError}</div>}
          
          <div className={`signup-input-container ${firstNameError ? 'error-container' : ''}`}>
            <FaUser className="signup-input-icon" />
            <input 
              type="text" 
              placeholder="First Name (max 20 characters)" 
              className={`signup-input ${firstNameError ? 'error' : ''}`}
              value={firstName} 
              onChange={(e) => {
                const inputValue = e.target.value;
                
                // Check if input contains only letters
                if (!validateName(inputValue) && inputValue.length > 0) {
                  setFirstNameError('Please enter a valid first name');
                  return;
                }
                
                // If input exceeds 20 chars, truncate and show error
                if (inputValue.length > 20) {
                  setFirstName(inputValue.slice(0, 20));
                  setFirstNameError('Maximum 20 characters allowed');
                } else {
                  // Otherwise, just set the value and clear error
                  setFirstName(inputValue);
                  setFirstNameError('');
                }
              }}
              maxLength={20}
              required 
            />
          </div>
          {firstNameError && <div className="error-message">{firstNameError}</div>}

          <div className={`signup-input-container ${lastNameError ? 'error-container' : ''}`}>
            <FaUser className="signup-input-icon" />
            <input 
              type="text" 
              placeholder="Last Name (max 20 characters)" 
              className={`signup-input ${lastNameError ? 'error' : ''}`}
              value={lastName} 
              onChange={(e) => {
                const inputValue = e.target.value;
                
                // Check if input contains only letters
                if (!validateName(inputValue) && inputValue.length > 0) {
                  setLastNameError('Please enter a valid last name');
                  return;
                }
                
                // If input exceeds 20 chars, truncate and show error
                if (inputValue.length > 20) {
                  setLastName(inputValue.slice(0, 20));
                  setLastNameError('Maximum 20 characters allowed');
                } else {
                  // Otherwise, just set the value and clear error
                  setLastName(inputValue);
                  setLastNameError('');
                }
              }}
              maxLength={20}
              required 
            />
          </div>
          {lastNameError && <div className="error-message">{lastNameError}</div>}
         
          <div className="signup-input-container">
            <FaVenusMars className="signup-input-icon" />
            <select 
              className="signup-input"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className={`signup-input-container ${ageError ? 'error-container' : ''}`}>
            <FaBirthdayCake className="signup-input-icon" />
            <input 
              type="number"
              placeholder="Age (16-100)" 
              className={`signup-input ${ageError ? 'error' : ''}`}
              value={age}
              onChange={(e) => {
                // Limit to 3 digits
                const value = e.target.value.slice(0, 3);
                setAge(value);
                
                // Validate age only if there's a value
                if (value) {
                  const numValue = parseInt(value);
                  if (numValue < 16 || numValue > 100) {
                    setAgeError('Age must be between 16-100');
                  } else {
                    setAgeError('');
                  }
                } else {
                  setAgeError('');
                }
              }}
              min="16"
              max="100"
              maxLength="3"
              required 
            />
          </div>
          {ageError && <div className="error-message">{ageError}</div>}

          <div className={`signup-input-container ${phoneError ? 'error-container' : phoneAvailable && phoneNumber.length > 12 ? 'success-container' : ''}`}>
            <FaPhone className="signup-input-icon" />
            <div className="phone-input-wrapper">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  let value = e.target.value;
                  setPhoneAvailable(false);
                  if (!value.startsWith('+639')) {
                    value = '+639';
                  }
                  const numbersOnly = value.slice(4).replace(/\D/g, '');
                  if (numbersOnly.length <= 9) {
                    setPhoneNumber('+639' + numbersOnly);
                    if (numbersOnly.length === 9) {
                      // Check if phone exists after a short delay (debounce)
                      const timer = setTimeout(() => {
                        checkExistingPhone('+639' + numbersOnly);
                      }, 500);
                      return () => clearTimeout(timer);
                    } else {
                      setPhoneError('');
                    }
                  }
                }}
                onBlur={() => {
                  if (validatePhoneNumber(phoneNumber)) {
                    checkExistingPhone(phoneNumber);
                  } else {
                    setPhoneError('Please enter a valid phone number');
                  }
                }}
                placeholder="9XXXXXXXXX"
                className={`signup-input ${phoneError ? 'error' : ''}`}
                required
              />
              {isCheckingPhone && 
                <div className="loader-container">
                  <div className="loader"></div>
                </div>
              }
              {phoneAvailable && !isCheckingPhone && phoneNumber.length > 12 && 
                <div className="success-indicator"></div>
              }
            </div>
          </div>
          {phoneError && <div className="error-message">{phoneError}</div>}
          
          <div className="signup-input-container">
            <select 
              className="signup-input"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
            >
              <option value="">Select Course</option>
              <option value="BSCS">BSCS</option>
              <option value="BSIT">BSIT</option>
            </select>
          </div>

          <div className={`signup-input-container ${heightError ? 'error-container' : ''}`}>
            <FaRuler className="signup-input-icon" />
            <input 
              type="number"
              placeholder="Height (140-250 cm)" 
              className={`signup-input ${heightError ? 'error' : ''}`}
              value={height}
              onChange={(e) => {
                // Limit to 3 digits
                const value = e.target.value.slice(0, 3);
                setHeight(value);
                
                // Validate height only if there's a value
                if (value) {
                  const numValue = parseInt(value);
                  if (numValue < 140 || numValue > 250) {
                    setHeightError('Height must be between 140-250 cm');
                  } else {
                    setHeightError('');
                  }
                } else {
                  setHeightError('');
                }
              }}
              min="140"
              max="250"
              maxLength="3"
              required 
            />
          </div>
          {heightError && <div className="error-message">{heightError}</div>}

          <div className={`signup-input-container ${weightError ? 'error-container' : ''}`}>
            <FaWeight className="signup-input-icon" />
            <input 
              type="number"
              placeholder="Weight (40-500 kg)" 
              className={`signup-input ${weightError ? 'error' : ''}`}
              value={weight}
              onChange={(e) => {
                // Limit to 3 digits
                const value = e.target.value.slice(0, 3);
                setWeight(value);
                
                // Validate weight only if there's a value
                if (value) {
                  const numValue = parseInt(value);
                  if (numValue < 40 || numValue > 500) {
                    setWeightError('Weight must be between 40-500 kg');
                  } else {
                    setWeightError('');
                  }
                } else {
                  setWeightError('');
                }
              }}
              min="40"
              max="500"
              maxLength="3"
              required 
            />
          </div>
          {weightError && <div className="error-message">{weightError}</div>}

          <div className={`signup-input-container ${passwordError ? 'error-container' : ''}`}>
            <FaLock className="signup-input-icon" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password (7-20 characters)" 
              className={`signup-input ${passwordError ? 'error' : ''}`}
              value={password} 
              onChange={(e) => {
                const newPassword = e.target.value;
                setPassword(newPassword);
                validatePassword(newPassword);
              }}
              minLength="7"
              maxLength="20"
              required 
              autoComplete="new-password"
            />
            <div 
              className="signup-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FaEye className="signup-password-icon" />
              ) : (
                <FaEyeSlash className="signup-password-icon" />
              )}
            </div>
          </div>
          {passwordError && <div className="error-message">{passwordError}</div>}
          <button type="submit" className="signup-button">
            SIGN UP
          </button>
        </form>
        <div className="signup-login-link">
          Already have an account? <a href="/signin">Sign In</a>
        </div>
      </div>
    </div>
  );
}

export default SignUp;