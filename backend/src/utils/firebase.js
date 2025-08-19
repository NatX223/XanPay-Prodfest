const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

const CREDENTIALS = JSON.parse(
    Buffer.from(process.env.CRED, 'base64').toString('utf-8')
);
// Get Firebase Storage instance
admin.initializeApp({
    credential: admin.credential.cert(CREDENTIALS),
    storageBucket: 'flaresec-1dfea.firebasestorage.app'
});
const db = admin.firestore();
const storage = admin.storage();
const auth = admin.auth();

module.exports = {storage, db, auth};