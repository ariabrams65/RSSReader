function removeTrailingSlash(iconUrl) {
    if (iconUrl !== undefined && iconUrl.slice(-1) === '/') {
        return iconUrl.substring(0, iconUrl.length - 1);
    }
    return iconUrl;
}

module.exports = removeTrailingSlash;