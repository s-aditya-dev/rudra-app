import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest.js";
import './Login.css';

// Logo importing
import RudraLogo from '../../Assets/rudra-logo.jsx'

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errMessage, seterrMessage] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    const rememberedPassword = localStorage.getItem('rememberedPassword');

    if (rememberedUsername && rememberedPassword) {
      setUsername(rememberedUsername);
      setPassword(rememberedPassword);
      setRemember(true);
    }
  }, []);

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    if (value.length > 20) {
      setUsername(value.slice(0, 20));
      setUsernameError('Username will not exceed 20 characters.');
    } else if (!value.match(/^[a-zA-Z0-9_.]*$/)) {
      setUsernameError('Username should only contain alphabets, numbers, dots, and underscores.');
    } else {
      setUsername(value);
      setUsernameError('');
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    if (value.length > 10) {
      setPasswordError('Password will not exceed 10 characters.');
    } else if (!value.match(/^[a-zA-Z0-9]*$/)) {
      setPasswordError('Password should only contain alphabets and numbers.');
    } else {
      setPassword(value);
      setPasswordError('');
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    document.getElementById('password').focus()
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username) {
      setUsernameError('The username cannot be empty');
    } else if (!username.match(/^[a-zA-Z0-9_.]*$/)) {
      // username select logic here if needed
    } else if (!password) {
      setPasswordError('The password cannot be empty');
    } else if (!password.match(/^[a-zA-Z0-9_.]*$/)) {
      // password select logic here if needed
    } else {
      if (remember) {
        localStorage.setItem('rememberedUsername', username);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberedPassword');
      }


      // Here will be the login code
      try {
        const res = await newRequest.post("/auth/login", {
          username,
          password,
        });
        localStorage.setItem("currentUser", JSON.stringify(res.data));
        navigate("/Panel");
      } catch (err) {
        if (err.message == 'Request failed with status code 404') {
          setUsernameError('Username or Password is incorrect.');
        } else if (err.message == 'Request failed with status code 400') {
          setPasswordError('Password is incorrect.');
        } else {
          seterrMessage(`*** ${err.message}! ***`);
        }
      }
    }
  };

  return (
    <div className="center-container">
      <div className="login-container">
        <h2><RudraLogo primaryFill={'var(--color-main)'} logoWidth={'120px'} /></h2>
        <form onSubmit={handleSubmit}>
          <div className="textbox-main">
            <input
              className="textbox"
              type="text"
              name="username"
              id="username"
              placeholder="Username"
              autoComplete="off"
              maxLength="25"
              value={username}
              onChange={handleUsernameChange}
            />
              
            <p className={usernameError ? 'Alert' : ''} id="User-Alert">{usernameError}</p>
          </div>

          <div className="textbox-main">
            <input
              className="textbox"
              type={passwordVisible ? "text" : "password"}
              name="password"
              id="password"
              placeholder="Password"
              maxLength="10"
              value={password}
              onChange={handlePasswordChange}
            />

            <span className="material-symbols-rounded" onClick={togglePasswordVisibility}>{passwordVisible ? "visibility" : "visibility_off"}</span>

            <p className={passwordError ? 'Alert' : ''} id="Password-Alert">{passwordError}</p>
          </div>

          <div className="remember-btn">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            <label htmlFor="remember">Remember Me</label>
          </div>

          <input className="submit-btn" type="submit" value="Login" />

          <p className='err-msg'>{errMessage}</p>
        </form>
      </div>
    </div>
  );
};

export default Login;
