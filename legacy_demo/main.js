
const UserManager = require('./UserManager');
const { connectToDB, DatabaseAdapter } = require('./db_utils');

function main() {
    const db = new DatabaseAdapter();
    const userManager = new UserManager(db);

    connectToDB("mysql://localhost:3306/legacy_db");

    try {
        const newUserId = userManager.createUser("Alice", "alice@example.com");
        console.log("Created user with ID:", newUserId);

        const user = userManager.getUser(newUserId);
        console.log("Retrieved user:", user);
    } catch (e) {
        console.error("Error:", e.message);
    }
}

main();
