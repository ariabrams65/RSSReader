import formatTimeSince from '../utils/formatTime';
import Modal from '../modals/Modal';
import SettingsModal from '../modals/SettingsModal';
import { useState } from 'react';
import usePosts from '../hooks/usePosts';
import { useCallback, useRef } from 'react';
import styles from './MainContent.module.css';

function MainContent() {
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
        <div className={styles['main-content']}>
            <Topnav/>
            <ItemList 
                posts={posts} 
                lastPostElementRef={lastPostElementRef} 
            />
        </div>
    ); 
}

function Topnav() {
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    
    function handleButtonClick(e) {
        setSettingsModalOpen(true);
        e.stopPropagation();
    }

    return (
        <ul className={styles['topnav']}>
            <li>
                <button onClick={handleButtonClick}>
                    settings
                </button>
                <Modal open={settingsModalOpen} onClose={() => setSettingsModalOpen(false)}>
                    <SettingsModal/>
                </Modal> 
            </li>
        </ul>
    );
}

function ItemList({ posts, lastPostElementRef }) {
    const postElements = posts.map((post, index) => {
        const attributes = {
            key: post.id,
            className: styles['item'] 
        };
        if (posts.length === index + 1) {
            attributes.ref = lastPostElementRef;
        }
        return (
            <li {...attributes}>
                <div className={styles['item-source']}>
                    {post.iconurl && <img className={styles['item-icon']} src={post.iconurl}/>}
                    <span>{post.feedtitle}</span>
                </div>
                <a href={post.url} className={styles['item-title']}>{post.title}</a>
                {post.commentsurl && <a href={post.commentsurl} className={styles['item-comments']}>Comments</a>}
                {post.mediaurl && <img className={styles['item-image']} src={post.mediaurl}/>}
                {post.date && <h3 className={styles['item-time']}>{formatTimeSince(post.date)}</h3>}
            </li>
        );
    });
    return <ul className={styles['item-list']}>{postElements}</ul>;
}

export default MainContent;