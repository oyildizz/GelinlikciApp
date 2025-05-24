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

exports.sendContactMail = functions.firestore
  .document("iletisimSorulari/{docId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();

    const mailOptions = {
      from: "angelhouseweddingg@gmail.com",
      to: "info@angelhousewedding.com",
      subject: "Yeni Bize Sor Mesajı",
      html: `
        <h3>Yeni Mesaj</h3>
        <p><strong>Ad Soyad:</strong> ${data.fullName}</p>
        <p><strong>Telefon:</strong> ${data.phone}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Soru:</strong> ${data.question}</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("E-posta gönderildi.");
    } catch (error) {
      console.error("E-posta gönderilemedi:", error);
    }
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
        <p><strong>Tarih:</strong> ${data.tarih}</p>
        <p><strong>Saat:</strong> ${data.saat}</p>
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
