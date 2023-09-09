import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoutes from './ProtectedRoutes';
import { SelectionProvider } from './context/SelectionContext'
import { SubscriptionProvider } from './context/SubscriptionContext';

function App() {
    return (
        <Routes>
            <Route element={<ProtectedRoutes checkAuthenticated={true}/>}>
                <Route element={
                    <SelectionProvider>
                        <SubscriptionProvider>
                            <Home/>
                        </SubscriptionProvider>
                    </SelectionProvider>
                } path="/"/>
            </Route>
            <Route element={<ProtectedRoutes checkAuthenticated={false}/>}>
                <Route element={<Login/>} path="/login"/>
                <Route path="/register" element={<Register/>}/>
            </Route>
        </Routes>        
    );
};
export default App;
