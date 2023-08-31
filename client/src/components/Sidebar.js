import { useEffect } from 'react';
import { useSubscriptions } from '../context/SubscriptionContext';
import SidebarHeader from './SidebarHeader';
import SidebarContent from './SidebarContent';

function Sidebar() {
    const { updateSubscriptions } = useSubscriptions();

    useEffect(() => {
            updateSubscriptions();
        }, []);

    return (
        <div className="sidebar">
            <SidebarHeader/>
            <SidebarContent/>
        </div>
    );
}

export default Sidebar;