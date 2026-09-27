const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: true,
  credentials: true,
}));

// Parse JSON bodies
app.use(express.json());

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "Savings Group API is working!",
    timestamp: new Date().toISOString(),
  });
});

// Member suggestions endpoint (basic implementation)
app.get("/api/suggestions/members", async (req, res) => {
  try {
    const query = req.query.q || "";
    const db = admin.firestore();

    // Get members from Firestore
    const membersRef = db.collection("members");
    const snapshot = await membersRef.get();

    const suggestions = [];

    if (query) {
      // Filter members based on query
      snapshot.forEach((doc) => {
        const member = doc.data();
        if (member.fullName.toLowerCase().includes(query.toLowerCase()) ||
            member.username.toLowerCase().includes(query.toLowerCase()) ||
            member.email.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push({
            id: doc.id,
            fullName: member.fullName,
            username: member.username,
            email: member.email,
          });
        }
      });
    }

    res.json({
      suggestions: suggestions.slice(0, 10), // Limit to 10 suggestions
      query: query,
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({error: "Failed to fetch suggestions"});
  }
});

// Export the Express app as a Cloud Function
exports.api = functions.region("us-central1").https.onRequest(app);
