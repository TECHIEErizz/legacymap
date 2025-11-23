
function connectToDB(connectionString) {
    console.log("Connecting to " + connectionString);
    return {
        isConnected: true
    };
}

function queryDB(query) {
    console.log("Executing: " + query);
    return [];
}

class DatabaseAdapter {
    insert(table, data) {
        console.log(`Inserting into ${table}`);
        return 123;
    }

    find(table, id) {
        console.log(`Finding ${id} in ${table}`);
        return { id, name: "John Doe" };
    }
}

module.exports = { connectToDB, queryDB, DatabaseAdapter };
