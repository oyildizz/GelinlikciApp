const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
require("dotenv").config();

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ozgeyildiz9943@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

exports.sendContactMail = functions.firestore
  .document("iletisimSorulari/{docId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();

    const mailOptions = {
      from: "ozgeyildiz9943@gmail.com",
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
