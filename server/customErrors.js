class QueryError extends Error {
    constructor(message) {
        super(message);
        this.name = 'QueryError';
    }
}

class UserError extends Error {
    constructor(message, status) {
        super(message)
        this.name = 'UserError';
        this.status = status;
    }
}

module.exports = { QueryError, UserError };