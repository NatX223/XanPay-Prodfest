const express = require('express');
const axios = require("axios");
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const routes = require('./routes/index');
// const { MailerSend, Recipient, EmailParams, Sender } = require("mailersend");
const { ethers } = require("ethers");
const { db, auth } = require('./utils/firebase');
const { verifyFirebaseToken } = require('./middleware/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3300;

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Routes
app.use('/api', routes);

const baseURL = process.env.BASE_URL || 'http://localhost:3300';

app.get('/', (req, res) => {
    res.send('Hello XanPay');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.post("/createAccount", async (req, res) => {
  const { email, password, businessName, businessImage } = req.body;
  const masterWalletId = process.env.MASTER_WALLET_ID;

  try {
    
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: businessName,
      photoURL: businessImage,
    });

    const options = {
      method: "POST",
      url: `https://api.blockradar.co/v1/wallets/${masterWalletId}/addresses`,
      headers: {
        "x-api-key": process.env.BLOCKRADAR_API_KEY,
        "Content-Type": "application/json",
      },
      data: {
        metadata: {
          description: `${businessName} Wallet`,
          businessName: businessName
        },
        name: `${businessName}-address`,
      },
    };

    const response = await axios(options);

    // get the address from BlockRadar response
    const userAddress = response.data?.data?.address;
    if (!userAddress) {
      throw new Error("Failed to retrieve address from BlockRadar response");
    }

    await db.collection("merchants").doc(userRecord.uid).set({
      businessName,
      businessImage,
      userAddress,
    });

    console.log("Successfully created new user:", userRecord.uid);
    res.status(201).json({
      message: "Merchant created successfully"
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/login", verifyFirebaseToken, async (req, res) => {
    try {
      const uuid = req.uid;
  
      // fetch merchant document
      const merchantRef = db.collection("merchant").doc(uuid);
      const merchantDoc = await merchantRef.get();
  
      if (!merchantDoc.exists) {
        return res.status(404).json({ error: "Merchant not found" });
      }
  
      const merchant = merchantDoc.data();
  
      // fetch blockchain accounts & balances
      const accounts = await client.getAccounts({ address: merchant.userAddress });
      if (!accounts || accounts.length === 0) {
        return res.status(400).json({ error: "No accounts found for user" });
      }
  
      const balance = await client.getTokenBalances({
        account: accounts[0],
        chain,
        token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
      });
  
      const userBalance = balance.length
        ? ethers.formatUnits(balance[0].value, balance[0].decimals)
        : "0";
  
      // construct response object
      const businessDetails = {
        businessName: merchant.businessName || null,
        businessImage: merchant.businessImage || null,
        userBalance,
      };
  
      return res.json({
        message: "Business Returned",
        business: businessDetails,
      });
    } catch (error) {
      console.error("Error in /login:", error);
      return res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
});

