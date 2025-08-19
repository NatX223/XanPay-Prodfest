const { auth } = require('../utils/firebase');

async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];

  if (!token) return res.status(401).send("Unauthorized");

  try {
      const decodedToken = await auth.verifyIdToken(token);
      req.uid = decodedToken.uid;
      next();
    } catch (error) {
      return res.status(401).send("Invalid token");
    }
}

module.exports = {verifyFirebaseToken};