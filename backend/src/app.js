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
const { v4: uuidv4 } = require('uuid');

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

// Function to process invoice payment
async function processInvoicePayment(invoiceCode, amountPaid, merchantId, currency = 'USDC') {
  try {
    // Get the invoice
    const invoiceRef = db.collection("merchants").doc(merchantId).collection("invoices").doc(invoiceCode);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) {
      throw new Error("Invoice not found");
    }

    const invoiceData = invoiceDoc.data();

    // Check if invoice is already paid
    if (invoiceData.paid) {
      throw new Error("Invoice is already paid");
    }

    // Check if invoice is still valid
    if (invoiceData.validUntil && Date.now() > invoiceData.validUntil) {
      throw new Error("Invoice has expired");
    }

    // Get product details to calculate total amount
    const productRef = db.collection("merchants").doc(merchantId).collection("products").doc(invoiceData.product);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      throw new Error("Product not found");
    }

    const productData = productDoc.data();
    const totalAmount = productData.price * invoiceData.quantity;

    // Check if payment amount is sufficient
    if (amountPaid < totalAmount) {
      throw new Error(`Insufficient payment. Required: ${totalAmount}, Received: ${amountPaid}`);
    }

    // Check if there's enough product quantity
    if (productData.quantity < invoiceData.quantity) {
      throw new Error(`Insufficient product quantity. Available: ${productData.quantity}, Required: ${invoiceData.quantity}`);
    }

    // Update product quantity (reduce by invoice quantity)
    const newQuantity = productData.quantity - invoiceData.quantity;
    await productRef.update({
      quantity: newQuantity,
      updatedAt: Date.now()
    });

    // Update invoice to paid
    await invoiceRef.update({
      paid: true,
      paidAt: Date.now(),
      amountPaid: amountPaid,
      updatedAt: Date.now()
    });

    // Add transaction record for purchase
    const transactionId = uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();
    await db.collection("merchants").doc(merchantId).collection("transactions").doc(transactionId).set({
      type: "Purchase",
      amount: amountPaid,
      currency: currency,
      invoiceCode: invoiceCode,
      productName: productData.productName,
      quantity: invoiceData.quantity,
      createdAt: Date.now()
    });

    return {
      success: true,
      message: "Invoice payment processed successfully",
      invoiceCode,
      amountPaid,
      totalAmount,
      productQuantityRemaining: newQuantity,
      transactionId
    };

  } catch (error) {
    console.error("Error processing invoice payment:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

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
        disableAutoSweep: "true",
        enableGaslessWithdraw: "true",
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
      addressId: response.data?.data?.id, // Store the address ID from BlockRadar
      password, // TODO: In production, hash this password using bcrypt before storing
      createdAt: Date.now(),
    });

    const token = await auth.createCustomToken(userRecord.uid);

    console.log("Successfully created new user:", userRecord.uid);
    res.status(201).json({
      message: "Merchant created successfully",
      token
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Get user record by email
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return res.status(404).json({ error: "No account found with this email address" });
      }
      throw error;
    }

    // Get the merchant document to check stored password
    const merchantRef = db.collection("merchants").doc(userRecord.uid);
    const merchantDoc = await merchantRef.get();

    if (!merchantDoc.exists) {
      return res.status(404).json({ error: "Merchant account not found" });
    }

    // Create custom token for the user
    const customToken = await auth.createCustomToken(userRecord.uid);

    res.json({
      success: true,
      message: "Sign in successful",
      token: customToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL
      }
    });

  } catch (error) {
    console.error("Error in /signin:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

app.post("/login", async (req, res) => {
    try {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.split("Bearer ")[1];
    
      if (!token) return res.status(401).json({ error: "No token" });
    
      // Verify token
      const decoded = await auth.verifyIdToken(token);
    
      const uid = decoded.uid;
      const masterWalletId = process.env.MASTER_WALLET_ID;
  
      // fetch merchant document
      const merchantRef = db.collection("merchants").doc(uid);
      const merchantDoc = await merchantRef.get();
  
      if (!merchantDoc.exists) {
        return res.status(404).json({ error: "Merchant not found" });
      }
  
      const merchant = merchantDoc.data();
      const merchantAddress = merchant.userAddress;
  
      let userBalance = 0;
      
      const options = {
        method: "GET",
        url: `https://api.blockradar.co/v1/wallets/${masterWalletId}/addresses/${merchantAddress}/balance?assetId=d331b003-4970-4d83-a10e-0a5c1d43411c`,
        headers: {
          "x-api-key": process.env.BLOCKRADAR_API_KEY
        }
      };
  
      const response = await axios(options);
  
      if (response.status === 200) {
        userBalance = response.data?.data?.convertedBalance || 0;
      } else {
        throw new Error(`Payment API returned status: ${response.status}`);
      }
  
      // construct response object
      const businessDetails = {
        businessName: merchant.businessName || null,
        businessImage: merchant.businessImage || null,
        userAddress: merchant.userAddress || null,
        userBalance: userBalance
      };
  
      console.log(businessDetails);

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

app.post("/createInvoice", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split("Bearer ")[1];
  
    if (!token) return res.status(401).json({ error: "No token" });
  
    // Verify token
    const decoded = await auth.verifyIdToken(token);
  
    const uid = decoded.uid;
  
    const merchantRef = db.collection("merchants").doc(uid);
    const merchantDoc = await merchantRef.get();

    if (!merchantDoc.exists) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    const merchant = merchantDoc.data();    

    // Create invoice for this user
    const invoice = {
      businessName: merchant.businessName,
      businessImage: merchant.businessImage,
      product: req.body.product,
      quantity: req.body.quantity,
      paid: false,
      createdAt: Date.now(),
      validUntil: Date.now() + 7 * 24 * 60 * 60 * 1000, // optional 7-day validity
    };
  
    // Generate unique invoice code using UUID (first 8 characters for readability)
    const invoiceCode = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
    await db.collection("merchants").doc(uid).collection("invoices").doc(invoiceCode).set(invoice);
  
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.post("/addProduct", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split("Bearer ")[1];
  
    if (!token) return res.status(401).json({ error: "No token" });
  
    // Verify token
    const decoded = await auth.verifyIdToken(token);
  
    const uid = decoded.uid;
  
    const merchantRef = db.collection("merchants").doc(uid);
    const merchantDoc = await merchantRef.get();

    if (!merchantDoc.exists) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    // add product
    const product = {
      productName: req.body.productName,
      productImage: req.body.productImage,
      quantity: req.body.quantity,
      price: req.body.price,
      currency: req.body.currency,
      createdAt: Date.now(),
    };
  
    const productRef = await db.collection("merchants").doc(uid).collection("products").add(product);
  
    res.json({ success: true, productId: productRef.id, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.put("/updateProduct/:productId", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split("Bearer ")[1];
  
    if (!token) return res.status(401).json({ error: "No token" });
  
    // Verify token
    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;
    const { productId } = req.params;
    const updates = req.body.updates; // Array of {field, value} objects
  
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: "Updates array is required" });
    }

    // Verify merchant exists
    const merchantRef = db.collection("merchants").doc(uid);
    const merchantDoc = await merchantRef.get();

    if (!merchantDoc.exists) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    // Get product reference
    const productRef = db.collection("merchants").doc(uid).collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Build update object from updates array
    const updateData = {};
    const allowedFields = ['productName', 'productImage', 'quantity', 'price', 'currency'];
    
    for (const update of updates) {
      const { field, value } = update;
      
      if (!allowedFields.includes(field)) {
        return res.status(400).json({ error: `Invalid field: ${field}. Allowed fields: ${allowedFields.join(', ')}` });
      }
      
      updateData[field] = value;
    }

    // Add updatedAt timestamp
    updateData.updatedAt = Date.now();

    // Update the product
    await productRef.update(updateData);

    // Get updated product data
    const updatedProductDoc = await productRef.get();
    const updatedProduct = updatedProductDoc.data();

    res.json({ 
      success: true, 
      message: "Product updated successfully",
      productId,
      updatedFields: Object.keys(updateData),
      product: updatedProduct
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split("Bearer ")[1];
  
    if (!token) return res.status(401).json({ error: "No token" });
  
    // Verify token
    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;

    // Verify merchant exists
    const merchantRef = db.collection("merchants").doc(uid);
    const merchantDoc = await merchantRef.get();

    if (!merchantDoc.exists) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    // Get all products for this merchant
    const productsSnapshot = await db.collection("merchants").doc(uid).collection("products").get();

    if (productsSnapshot.empty) {
      return res.json({ 
        success: true, 
        message: "No products found",
        products: []
      });
    }

    // Map products with document IDs
    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ 
      success: true, 
      message: "Products retrieved successfully",
      count: products.length,
      products
    });
  } catch (err) {
    console.error("Error getting products:", err);
    res.status(500).json({ error: "Failed to retrieve products" });
  }
});

app.get("/invoice/:invoiceCode", async (req, res) => {
  try {
    const { invoiceCode } = req.params;

    if (!invoiceCode) {
      return res.status(400).json({ error: "Invoice code is required" });
    }

    // Search for the invoice across all merchants
    const merchantsSnapshot = await db.collection("merchants").get();
    
    let invoiceData = null;
    let merchantUid = null;

    // Find the invoice in any merchant's collection
    for (const merchantDoc of merchantsSnapshot.docs) {
      const invoiceRef = db.collection("merchants").doc(merchantDoc.id).collection("invoices").doc(invoiceCode);
      const invoiceDoc = await invoiceRef.get();
      
      if (invoiceDoc.exists) {
        invoiceData = invoiceDoc.data();
        merchantUid = merchantDoc.id;
        break;
      }
    }

    if (!invoiceData) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Get product details if product ID exists
    let productDetails = null;
    if (invoiceData.product && merchantUid) {
      const productRef = db.collection("merchants").doc(merchantUid).collection("products").doc(invoiceData.product);
      const productDoc = await productRef.get();
      
      if (productDoc.exists) {
        const productData = productDoc.data();
        productDetails = {
          id: productDoc.id,
          productName: productData.productName,
          productImage: productData.productImage,
          price: productData.price,
          currency: productData.currency
        };
      }
    }

    // Construct response with invoice and product details
    const response = {
      success: true,
      invoice: {
        invoiceCode,
        businessName: invoiceData.businessName,
        businessImage: invoiceData.businessImage,
        quantity: invoiceData.quantity,
        paid: invoiceData.paid || false,
        createdAt: invoiceData.createdAt,
        validUntil: invoiceData.validUntil,
        product: productDetails
      }
    };

    res.json(response);
  } catch (err) {
    console.error("Error getting invoice:", err);
    res.status(500).json({ error: "Failed to retrieve invoice" });
  }
});

app.post('/webhook/deposit', async (req, res) => {
  try {
    const { event, data } = req.body;

    if (event !== 'deposit.success') {
      return res.sendStatus(200);
    }

    // Extract deposit details
    const {
      recipientAddress,
      amount,
      currency,
      hash,
      note
    } = data;

    // Lookup merchant using recipientAddress
    let userDoc;
    let merchantId;
    if (recipientAddress) {
      const merchantsSnapshot = await db.collection('merchants').where('userAddress', '==', recipientAddress).get();
      if (!merchantsSnapshot.empty) {
        const merchantDoc = merchantsSnapshot.docs[0];
        userDoc = merchantDoc.data();
        merchantId = merchantDoc.id;
      }
    }

    if (!userDoc) {
      console.warn('No user found for recipient address:', recipientAddress);
      return res.sendStatus(200);
    }

    // Check if note exists as an invoice in the merchant's invoices collection
    let isInvoicePayment = false;
    if (note && note.trim()) {
      const invoiceRef = db.collection("merchants").doc(merchantId).collection("invoices").doc(note.trim());
      const invoiceDoc = await invoiceRef.get();
      isInvoicePayment = invoiceDoc.exists;
    }

    if (isInvoicePayment) {
      // Process as invoice payment
      const result = await processInvoicePayment(note.trim(), parseFloat(amount), merchantId, currency);
      
      if (result.success) {
        console.log('Invoice payment processed successfully:', result);
      } else {
        console.error('Invoice payment failed:', result.error);
      }
    } else {
      await db.collection("merchants").doc(merchantId).collection("transactions").add({
        type: "Deposit",
        amount: parseFloat(amount),
        currency: currency,
        note: note || null,
        hash: hash,
        createdAt: Date.now()
      });

      console.log('Deposit transaction recorded:', hash);
    }

    res.send(200);
  } catch (err) {
    console.error('Error handling webhook:', err);
    res.sendStatus(500);
  }
});

app.post('/updateBankDetails', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split("Bearer ")[1];

    if (!token) return res.status(401).json({ error: "No token" });

    // Verify token
    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;

    const { bank, accountNum, accountName } = req.body;

    // Validate required fields
    if (!bank || !accountNum || !accountName) {
      return res.status(400).json({ 
        error: "All bank details are required: bank, accountNum, accountName" 
      });
    }

    // Verify merchant exists
    const merchantRef = db.collection("merchants").doc(uid);
    const merchantDoc = await merchantRef.get();

    if (!merchantDoc.exists) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    // Update bank details
    await merchantRef.update({
      bank,
      accountNum,
      accountName,
      updatedAt: Date.now()
    });

    res.json({
      success: true,
      message: "Bank details updated successfully"
    });
  } catch (err) {
    console.error("Error updating bank details:", err);
    res.status(500).json({ error: "Failed to update bank details" });
  }
});

app.get('/transactions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split("Bearer ")[1];

    if (!token) return res.status(401).json({ error: "No token" });

    // Verify token
    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;

    // Verify merchant exists
    const merchantRef = db.collection("merchants").doc(uid);
    const merchantDoc = await merchantRef.get();

    if (!merchantDoc.exists) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    // Get all transactions for this merchant
    const transactionsSnapshot = await db.collection("merchants").doc(uid).collection("transactions").get();

    if (transactionsSnapshot.empty) {
      return res.json({
        success: true,
        message: "No transactions found",
        transactions: []
      });
    }

    // Map transactions with document IDs
    const transactions = transactionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      message: "Transactions retrieved successfully",
      count: transactions.length,
      transactions
    });
  } catch (err) {
    console.error("Error getting transactions:", err);
    res.status(500).json({ error: "Failed to retrieve transactions" });
  }
});

app.post('/withdrawCrypto', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split("Bearer ")[1];

    if (!token) return res.status(401).json({ error: "No token" });

    // Verify token
    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;

    // Verify merchant exists
    const merchantRef = db.collection("merchants").doc(uid);
    const merchantDoc = await merchantRef.get();
    const merchantId = merchantDoc.id;
    if (!merchantDoc.exists) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    const merchant = merchantDoc.data();
    const merchantAddress = merchant.userAddress;
    const merchantAddressId = merchant.addressId;

    const transactionId = uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();

    const options = {
      method: "POST",
      url: `https://api.blockradar.co/v1/wallets/${masterWalletId}/addresses/${merchantAddressId}/withdraw`,
      headers: {
        "x-api-key": process.env.BLOCKRADAR_API_KEY,
        "Content-Type": "application/json",
      },
      data: {
        assets: [
          {
            "address": req.body.recipient,
            "amount": req.body.amount,
            "id": "d331b003-4970-4d83-a10e-0a5c1d43411c",
            "reference": transactionId
          }
        ]
      },
    };

    const response = await axios(options);

    if (response.status === 200) {
      await db.collection("merchants").doc(merchantId).collection("transactions").doc(transactionId).set({
        type: "Send",
        amount: req.body.amount,
        currency: "USDC",
        createdAt: Date.now()
      });
      res.json({
        success: true,
        message: "Payment initiated successfully",
        transactionId: transactionId
      });
    } else {
      throw new Error(`Payment API returned status: ${response.status}`);
    }

  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to initiate payment",
      details: error.message
    });
  }
})

const fetchRate = async (token, amount, currency, network) => {
  try {
    const response = await axios.get(
      `https://api.paycrest.io/v1/rates/${token}/${amount}/${currency}`,
      {
        params: { network },
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.data; // rate string
  } catch (error) {
    throw new Error(
      `Rate fetch failed: ${error.response?.statusText || error.message}`
    );
  }
};

app.post('/withdrawFiat', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split("Bearer ")[1];

    if (!token) return res.status(401).json({ error: "No token" });

    // Verify token
    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;

    const masterWalletId = process.env.MASTER_WALLET_ID;
    const transactionId = uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();

    // Verify merchant exists
    const merchantRef = db.collection("merchants").doc(uid);
    const merchantDoc = await merchantRef.get();

    if (!merchantDoc.exists) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    const merchantId = merchantDoc.id;
    const merchant = merchantDoc.data();
    const merchantAddress = merchant.userAddress;
    const merchantName = merchant.businessName;
    const merchantAddressId = merchant.addressId;

    // Check if merchant has bank details
    if (!merchant.bank || !merchant.accountNum || !merchant.accountName) {
      return res.status(400).json({ 
        error: "Bank details not configured. Please update your bank information first." 
      });
    }

    // Check if addressId exists
    if (!merchantAddressId) {
      return res.status(400).json({ 
        error: "Address ID not found. Please contact support." 
      });
    }

    // Get rate from Paycrest
    const rateResponse = await fetchRate('USDC', req.body.amount, 'NGN', 'base');
    console.log("Rate response:", rateResponse);
    
    // create order with proper structure
    const orderData = {
      amount: parseFloat(req.body.amount),
      token: 'USDC',
      network: 'base',
      rate: rateResponse, // Include the rate from the rate API
      recipient: {
        institution: merchant.bank,
        accountIdentifier: merchant.accountNum,
        accountName: merchant.accountName,
        currency: 'NGN',
        memo: `Settlement for XanPay merchant - ${merchantName}`
      },
      reference: `merchant-${transactionId}`,
      returnAddress: merchantAddress
    };

    console.log("Creating Paycrest order with data:", JSON.stringify(orderData, null, 2));

    const response = await axios.post(
      "https://api.paycrest.io/v1/sender/orders",
      orderData,
      {
        headers: {
          "API-Key": process.env.PAYCREST_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const order = response.data;
    console.log("Order created successfully:", order);
    
    // Check if receiveAddress exists in the response
    const receiveAddress = order.data.receiveAddress;
    
    if (!receiveAddress) {
      console.error("No receive address found in order response:", order);
      return res.status(400).json({
        success: false,
        message: "Failed to get receive address from payment provider"
      });
    }
    
    console.log("Using receive address:", receiveAddress);

    await merchantRef.collection("fiat_withdrawals").add(order);

    const options = {
      method: "POST",
      url: `https://api.blockradar.co/v1/wallets/${masterWalletId}/addresses/${merchantAddressId}/withdraw`,
      headers: {
        "x-api-key": process.env.BLOCKRADAR_API_KEY,
        "Content-Type": "application/json",
      },
      data: {
        assets: [
          {
            "address": receiveAddress,
            "amount": req.body.amount,
            "id": "d331b003-4970-4d83-a10e-0a5c1d43411c",
            "reference": transactionId
          }
        ]
      },
    };

    const paymentResponse = await axios(options);

    if (paymentResponse.status === 200) {
      // Record successful transaction
      await db.collection("merchants").doc(merchantId).collection("transactions").doc(transactionId).set({
        type: "Fiat",
        amount: req.body.amount,
        currency: "NGN",
        reference: transactionId,
        orderId: order.data.id,
        status: "initiated",
        createdAt: Date.now()
      });

      console.log(`Fiat withdrawal initiated successfully for merchant ${merchantId}:`, {
        transactionId,
        amount: req.body.amount,
        orderId: order.data.id
      });

      res.json({
        success: true,
        message: "Fiat withdrawal initiated successfully",
        transactionId: transactionId,
        orderId: order.data.id,
        amount: req.body.amount,
        currency: "NGN",
        rate: rate
      });
    } else {
      throw new Error(`Payment API returned status: ${paymentResponse.status}`);
    }

  } catch (error) {
    console.error("Error processing fiat withdrawal:", error);
    
    // Return appropriate error response
    if (error.response) {
      // API error response - log the full response for debugging
      console.error("API Error Response:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Check for specific Paycrest API errors
      const apiData = error.response.data;
      if (apiData?.data?.field === 'Token' && apiData?.data?.message?.includes('not configured')) {
        return res.status(503).json({
          success: false,
          error: "Service configuration issue",
          details: "The payment service is not properly configured for USDC transactions. Please contact support.",
          code: "TOKEN_NOT_CONFIGURED"
        });
      }
      
      res.status(error.response.status || 500).json({
        success: false,
        error: "Payment processing failed",
        details: error.response.data?.message || error.response.data || error.message,
        apiError: error.response.data
      });
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      // Network connectivity issues
      res.status(503).json({
        success: false,
        error: "Service temporarily unavailable",
        details: "Unable to connect to payment service"
      });
    } else {
      // General server error
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message
      });
    }
  }
})