import { Link } from 'react-router-dom';

function Login() {
    return (
        <>
            <h1>Login</h1> 
            <form action="/login" method="POST">
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" required></input>
                </div> 
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" required></input>
                </div>
                <button type="submit">Login</button>
            </form>
            <Link to="/register">Register</Link>
        </>
    );
}

export default Login;