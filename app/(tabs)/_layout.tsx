import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { View, Platform } from 'react-native';

import HomeScreen from './HomeScreen';
import AppointmentCardScreen from './AppointmentCardScreen';
import CreateAppointmentScreen from './CreateAppointmentScreen';
import AccountScreen from './AccountScreen';
import AskUsModal from './AskUsModal';

const Tab = createBottomTabNavigator();

function AskUsRedirect() {
  useEffect(() => {
    const fullName = 'İsminizi yazın';
    const phone = 'Telefonunuzu yazın';
    const email = 'Mail adresinizi yazın';
    const question = 'Sorunuzu yazın';

    const message = `👋 Merhaba, bir soru göndermek istiyorum:\n\n👤 Ad Soyad: ${fullName}\n📱 Telefon: ${phone}\n✉️ Email: ${email}\n❓ Soru: ${question}`;
    const whatsappNumber = '905074185428'; // numaranızı yazın
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(err => {
      console.error('WhatsApp bağlantısı açılamadı:', err);
    });
  }, []);

  return null;
}

export default function Layout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: '#104438',
          height: 80,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'white',
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
          flexWrap: 'wrap',
          textAlign: 'center',
          justifyContent: 'center',
          width: 90,
        },
        tabBarItemStyle: {
          width: 80,
          padding: 7,
        },
        tabBarIcon: ({ color }) => {
          let iconName: keyof typeof Feather.glyphMap = 'home';

          if (route.name === 'Ana Sayfa') iconName = 'home';
          else if (route.name === 'Randevu Oluştur') iconName = 'file-text';
          else if (route.name === 'Bize Sor') iconName = 'message-circle';
          else if (route.name === 'Prova Kartı') iconName = 'calendar';
          else if (route.name === 'Hesabım') iconName = 'user';

          if (route.name === 'Bize Sor') {
            return (
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 35,
                  width: 64,
                  height: 64,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: Platform.OS === 'android' ? 40 : 40,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 8,
                }}
              >
                <FontAwesome name="comment" size={28} color="black" />
              </View>
            );
          }

          return <Feather name={iconName} size={24} color="white" />;
        },
      })}
    >
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
      <Tab.Screen name="Randevu Oluştur" component={CreateAppointmentScreen} />
      <Tab.Screen name="Bize Sor" component={AskUsModal} />
      <Tab.Screen name="Prova Kartı" component={AppointmentCardScreen} />
      <Tab.Screen name="Hesabım" component={AccountScreen} />
    </Tab.Navigator>
  );
}
