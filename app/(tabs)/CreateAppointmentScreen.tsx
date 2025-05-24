import React from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useAuth } from '../context/AuthContext';
import { saveLocalAppointment } from '../services/storage';

export default function CreateAppointmentScreen() {
  const { user } = useAuth();

  const handleMessage = async (event: WebViewMessageEvent) => {
    try {
       console.log("GELEN VERİ:", event.nativeEvent.data); // bu çalışıyor mu?
      const data = JSON.parse(event.nativeEvent.data);
   console.log("WebView verisi:", data);
      if (!user) {
        await saveLocalAppointment(data);
     
      } else {
        // 🔒 Firebase ile eşleştirilecekse burada yapılabilir
        // firestore().collection('randevular').add({ ...data, userId: user.uid, createdAt: new Date() });
      }
    } catch (e) {
      console.warn('Geçersiz veri alındı:', e);
    }
  };

  return (
    <WebView
      source={{ uri: 'https://angelhousewedding.com/randevu-al' }}
      onMessage={handleMessage}
    />
  );
  
}
