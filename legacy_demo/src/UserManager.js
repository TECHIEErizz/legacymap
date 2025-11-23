
class UserManager {
    constructor(db) {
        this.db = db;
    }

    createUser(name, email) {
        this.validateEmail(email);
        const userId = this.db.insert("users", { name, email });
        return userId;
    }

    validateEmail(email) {
        if (!email.includes("@")) {
            throw new Error("Invalid email");
        }
    }

    getUser(id) {
        return this.db.find("users", id);
    }
}

module.exports = UserManager;
