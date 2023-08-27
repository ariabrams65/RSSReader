import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import ProtectedRoutes from './ProtectedRoutes';

function App() {
    return (
        <Routes>
            <Route element={<ProtectedRoutes checkAuthenticated={true}/>}>
                <Route element={<Home/>} path="/"/>
            </Route>
            <Route element={<ProtectedRoutes checkAuthenticated={false}/>}>
                <Route element={<Login/>} path="/login"/>
                <Route path="/register" element={<Register/>}/>
            </Route>
        </Routes>        
    );
};
export default App;
