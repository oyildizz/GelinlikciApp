import React, { useEffect } from 'react';
import { Linking } from 'react-native';

export default function AskUsModal() {
  useEffect(() => {
    const whatsappNumber = '905399526435'; 
    const url = `https://wa.me/${whatsappNumber}`; // ❌ ?text= yok çünkü kişi kendi yazacak

    Linking.openURL(url).catch(err => {
      console.error('WhatsApp bağlantısı açılamadı:', err);
    });
  }, []);

  return null;
}