import { Link } from 'react-router-dom';

function Register() {
    return (
        <>
            <h1>Register</h1>
            <form action="/register" method="POST">
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" required></input>
                </div> 
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" required></input>
                </div>
                <button type="submit">Register</button>
            </form>
            <Link to="/login">Log in</Link>
        </>
    );
}

export default Register;