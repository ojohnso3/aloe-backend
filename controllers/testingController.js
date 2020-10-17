const db = require("../db.js");
async function testingFunctionNameOne() {
    const snapshot = await db.collection('users').get();

    snapshot.forEach((doc) => {
        console.log(doc.id, '=>', doc.data());
    });
    
    return "Testing!";
}