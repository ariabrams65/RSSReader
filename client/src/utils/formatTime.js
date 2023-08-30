function formatTimeSince(date) {
    const timeDifference = new Date() - new Date(date);
    if (timeDifference < 60000) { 
        return Math.floor(timeDifference / 1000) + 's';
    } else if (timeDifference < 3600000) {
        return Math.floor(timeDifference / 60000) + 'm';
    } else if (timeDifference < 86400000) {
        return Math.floor(timeDifference / 3600000) + 'h';
    } else {
        return Math.floor(timeDifference / 86400000) + 'd';
    }
}

export default formatTimeSince;