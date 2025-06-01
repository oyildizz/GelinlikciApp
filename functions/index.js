const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
require("dotenv").config();

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "angelhouseweddingg@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});


exports.sendProvaMail = functions.firestore
  .document("provaRandevular/{docId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();

    const mailOptions = {
      from: "angelhouseweddingg@gmail.com",
      to: "info@angelhousewedding.com",
      subject: "Yeni Prova Randevusu Alındı!",
      html: `
        <h3>Yeni Prova Randevusu</h3>
        <p><strong>Ad Soyad:</strong> ${data.name}</p>
        <p><strong>Telefon:</strong> ${data.phone}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        
        <p><strong>1. Prova Tarihi:</strong> ${data.tarih1}</p>
        <p><strong>1. Prova Saati:</strong> ${data.saat1}</p>
        
        <p><strong>2. Prova Tarihi:</strong> ${data.tarih2}</p>
        <p><strong>2. Prova Saati:</strong> ${data.saat2}</p>
        
        <p><strong>Ürün Teslim Tarihi:</strong> ${data.teslimTarihi}</p>
        <p><strong>Ürün Teslim Saati:</strong> ${data.teslimSaat}</p>

        <p><strong>Not:</strong> ${data.notlar || 'Yok'}</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Prova randevu e-postası gönderildi.");
    } catch (error) {
      console.error("Prova randevu e-postası gönderilemedi:", error);
    }
  });

