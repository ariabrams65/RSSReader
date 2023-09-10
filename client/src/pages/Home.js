import MainContent from '../components/MainContent';
import SidebarHeader from '../components/SidebarHeader'
import SidebarContent from '../components/SidebarContent';
import styles from './Home.module.css';

function Home() {
    return (
        <>
            <div className={styles['sidebar']}>
                <SidebarHeader/>
                <SidebarContent/>
            </div>
            <MainContent/>
        </>
    );
}

export default Home;