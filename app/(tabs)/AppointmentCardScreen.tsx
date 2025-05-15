import React from 'react';
import { WebView } from 'react-native-webview';
import {View , Text} from 'react-native'

export default function AppointmentCardScreen() {
  return (
    <WebView
      source={{ uri: 'https://angelhousewedding.com/randevu-al/' }}
      style={{ flex: 1 }}
    />
  );
}
