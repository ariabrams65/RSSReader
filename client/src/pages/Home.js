import MainContent from '../components/MainContent';
import SidebarHeader from '../components/SidebarHeader'
import SidebarContent from '../components/SidebarContent';


function Home() {
    return (
        <>
            <div className="sidebar">
                <SidebarHeader/>
                <SidebarContent/>
            </div>
            <MainContent/>
        </>
    );
}

export default Home;