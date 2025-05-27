import React, { useState, useCallback } from 'react';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useRoute } from '@react-navigation/native';

export default function CreateAppointmentScreen() {
   const [key, setKey] = useState(0);
    const route = useRoute();
    const routeParams = route.params as { refresh?: number } | undefined;
  
    useFocusEffect(
      useCallback(() => {
        setKey(prev => prev + 1);
      }, [routeParams?.refresh])
    );
  
    return (
      <WebView
        key={key}
        source={{ uri: 'https://angelhousewedding.com/randevu-al' }}
        style={{ flex: 1 }}
        sharedCookiesEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheMode="LOAD_NO_CACHE"
      />
    );
}
