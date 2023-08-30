import { createContext, useContext, useState } from 'react';

const SubscriptionContext = createContext(null);

function useSubscriptions() {
    return useContext(SubscriptionContext);
}


function SubscriptionProvider({ children }) {
    const [subscriptions, setSubscriptions] = useState([]);


    async function updateSubscriptions() {
        const res = await fetch('/subscriptions');
        const json = await res.json();
        setSubscriptions(json.subscriptions);
    }
    
    const value = {
        subscriptions,
        updateSubscriptions
    };
    
    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export {useSubscriptions, SubscriptionProvider};

