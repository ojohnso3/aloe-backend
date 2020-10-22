const db = require("../db.js");
async function testFunction() {
    const snapshot = await db.collection('users').get();

    snapshot.forEach((doc) => {
        console.log(doc.id, '=>', doc.data());
    });
    return "Testing!";
}

testFunction()

// module.exports = {
//     myFunction(req, res, error) {
//     //   const userId = req.params.id;
//       console.log('hi', req)
//     },
// }