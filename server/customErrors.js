class QueryError extends Error {
    constructor(message) {
        super(message);
        this.name = 'QueryError';
    }
}

class ServerError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'ServerError';
        this.status = status;
    }
}

module.exports = { QueryError, ServerError };