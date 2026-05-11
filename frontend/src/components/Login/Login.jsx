// import React, { useState } from 'react';
// import './Login.css'; 

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log('Email:', email);
//     console.log('Password:', password);
//   };

//   return (
//     <div className="login-container">
//       <div className="login-box">
//         <h2>Login</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="floating-label-input">
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               placeholder=" "
//             />
//             <label htmlFor="text">Username</label>
//           </div>
//           <div className="floating-label-input">
//             <input
//               type="password"
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               placeholder=" "
//             />
//             <label htmlFor="password">Password</label>
//           </div>
//           <button type="submit" className="submit-btn">Log In</button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;





import React, { useState } from 'react';
import axios from 'axios';  // For making HTTP requests
import { useNavigate } from 'react-router-dom';  // For redirecting after login
import './Login.css';  // Import your custom CSS

const Login = () => {
  const [username, setUsername] = useState('');  // State for username
  const [password, setPassword] = useState('');  // State for password
  const [error, setError] = useState('');  // State to handle errors
  const navigate = useNavigate();  // Hook for navigation

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Create form data to send as application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', username);  // Add username field
      formData.append('password', password);  // Add password field
  
      // Send POST request to the FastAPI backend for login
      const response = await axios.post('http://127.0.0.1:8000/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      // If login is successful, store the access token in localStorage
      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
  
      // Redirect the user to the /user page
      navigate('/user');
    } catch (err) {
      // Handle login failure (e.g., incorrect credentials)
      setError('Incorrect username or password');
      console.error(err.response ? err.response.data.detail : err.message);
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {/* Username Input Field */}
          <div className="floating-label-input">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}  // Update state
              required
              placeholder=" "
            />
            <label htmlFor="username">Username</label>
          </div>

          {/* Password Input Field */}
          <div className="floating-label-input">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}  // Update state
              required
              placeholder=" "
            />
            <label htmlFor="password">Password</label>
          </div>

          {/* Error message display */}
          {error && <div className="error">{error}</div>}

          {/* Submit Button */}
          <button type="submit" className="submit-btn">Log In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
