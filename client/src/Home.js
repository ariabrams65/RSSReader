import './App.css';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import usePosts from './usePosts';
import { useCallback, useRef } from 'react';
import { SubscriptionProvider } from './SubscriptionContext';


function Home() {
    const { posts, loading, hasMore, updatePosts } = usePosts();
    
    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) {
            observer.current.disconnect();
        }
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                updatePosts();
            }
        })
        if (node) {
            observer.current.observe(node);
        }
    }, [loading, hasMore]);
  
    return (
        <>
        <SubscriptionProvider>
            <Sidebar/>
        </SubscriptionProvider>
            <MainContent 
                posts={posts}
                lastPostElementRef={lastPostElementRef}
            />
        </>
    );
}

export default Home;