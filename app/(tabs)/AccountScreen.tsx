import React, { useEffect, useState } from 'react';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AccountScreen = () => {
  const [userToken, setUserToken] = useState<string | null>(null);

  // Kullanıcı token'ını AsyncStorage'dan alıyoruz ve giriş durumu kontrolü yapıyoruz
  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);  // Token varsa kullanıcı giriş yapmış demektir
    };
    loadToken();
  }, []);

  return (
    <WebView
      source={{
        uri: userToken ? 'https://angelhousewedding.com/hesabim' : 'https://angelhousewedding.com/uye-girisi/', // Giriş yapmışsa Hesabım sayfasını göster, yapmamışsa Üye Girişi sayfasını göster
      }}
      style={{ flex: 1 }}
    />
  );
};

export default AccountScreen;
