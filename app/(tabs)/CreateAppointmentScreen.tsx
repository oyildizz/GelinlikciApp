import React from 'react';
import { WebView } from 'react-native-webview';

export default function CreateAppointmentScreen() {
  return (
    <WebView
      source={{ uri: 'https://angelhousewedding.com/randevu-al/' }}
      style={{ flex: 1 }}
    />
  );
}
