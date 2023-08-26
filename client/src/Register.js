import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        const res = await fetch('/register', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        navigate('/login');
    }
    return (
        <>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email}
                        type="email" 
                        id="email" 
                        name="email" 
                        required
                    />
                </div> 
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        type="password"
                        id="password" 
                        name="password" 
                        required
                    />
                </div>
                <button type="submit">Register</button>
            </form>
            <Link to="/login">Log in</Link>
        </>
    );
}

export default Register;