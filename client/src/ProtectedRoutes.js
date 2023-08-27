import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function PrivateRoutes({ checkAuthenticated }) {
    //https://stackoverflow.com/questions/73188542/private-route-in-react-not-working-as-expected
    const { pathname } = useLocation();
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function getAuthenticated() {
            setLoading(true);
            const res = await fetch('/authenticated');
            setAuthenticated(res.status === 200);
            setLoading(false);
        }
        getAuthenticated();
    }, [pathname]);
    
    if (loading) {
        console.log('loading');
        return <div>Loading ...</div>
    }
    
    if (checkAuthenticated) {
        return authenticated ? <Outlet/> : <Navigate to='/login'/>;
    } else {
        return authenticated  ? <Navigate to='/'/> : <Outlet/>;
    }
}

export default PrivateRoutes;