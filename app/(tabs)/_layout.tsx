
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { WebView } from 'react-native-webview';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: 'white',
        tabBarStyle: {
          backgroundColor: '#006400',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          height: 80,
          paddingTop: 10,
          paddingBottom: 5,
          borderWidth: 0,
        },
        headerShown: false, // Bu satırı ekleyerek başlığı gizle
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          title: 'Ana Sayfa',
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="calendar" color={color} />,
        }}
        component={HomeScreen}
      />
      {/* Diğer Tab ekranlarını ekleyebilirsiniz */}
    </Tab.Navigator>
  );
}

// HomeScreen bileşeni
const HomeScreen = () => {
  return (
    <WebView
      source={{ uri: 'https://angelhousewedding.com/' }}
      style={{ flex: 1 }}
      sharedCookiesEnabled={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      cacheMode="LOAD_NO_CACHE"
    />
  );
};




























// import React, { useState, useEffect } from 'react'; // useState ve useEffect'i import ettik
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { IconSymbol } from '@/components/ui/IconSymbol';
// import { WebView } from 'react-native-webview';
// import { AskUsModal } from './AskUsModal'; // AskUsModal'ı import ettik
// import { Text, TextInput, Button } from 'react-native'; // Text ve TextInput'u import ettik
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // Tab navigation oluşturuluyor
// const Tab = createBottomTabNavigator();

// export default function TabLayout() {
//   const [isModalOpen, setIsModalOpen] = useState(false);  // Modal'ın açılıp kapanma durumunu yönetiyoruz

//   // Soruyu gönderme fonksiyonu (modal'dan alınan verileri işlemek için)
//   const handleSendQuestion = (data: { email: string; phone: string; name: string; question: string }) => {
//     console.log('Gönderilen Veriler:', data);
//     setIsModalOpen(false);  // Gönderildikten sonra modalı kapat
//   };

//   return (
//     <>
//       <Tab.Navigator
//         screenOptions={{
//           tabBarActiveTintColor: 'white',
//           tabBarStyle: {
//             backgroundColor: '#006400',
//             borderTopLeftRadius: 20,
//             borderTopRightRadius: 20,
//             position: 'absolute',
//             height: 80,
//             paddingTop: 10,
//             paddingBottom: 5,
//             borderWidth: 0,
//           },
//           headerShown: false,
//         }}
//       >
//         <Tab.Screen
//           name="Home"
//           options={{
//             title: 'Ana Sayfa',
//             tabBarIcon: ({ color }) => <IconSymbol size={32} name="calendar" color={color} />,
//           }}
//           component={HomeScreen}
//         />
//         <Tab.Screen
//           name="AppointmentCard"
//           options={{
//             title: 'Randevu Kartı',
//             tabBarIcon: ({ color }) => <IconSymbol size={32} name="calendar" color={color} />,
//           }}
//           component={AppointmentCardScreen}
//         />
//         <Tab.Screen
//           name="AskUs"
//           options={{
//             title: 'Bize Sor',
//             tabBarIcon: ({ color }) => <IconSymbol size={32} name="calendar" color={color} />,
//           }}
//           // Bize Sor ekranını şu an bir modal yerine yönlendirmiyoruz
//           // Çünkü modalı şu şekilde açıyoruz: onPress => setIsModalOpen(true)
//           component={() => <></>} // Bu ekran boş kalacak, modal butonunu aşağıda ekleyeceğiz
//         />
//         <Tab.Screen
//           name="CreateAppointment"
//           options={{
//             title: 'Randevu Oluştur',
//             tabBarIcon: ({ color }) => <IconSymbol size={32} name="calendar" color={color} />,
//           }}
//           component={CreateAppointmentScreen}
//         />
//         <Tab.Screen
//           name="Account"
//           options={{
//             title: 'Hesabım',
//             tabBarIcon: ({ color }) => <IconSymbol size={32} name="calendar" color={color} />,
//           }}
//           component={AccountScreen}
//         />
//       </Tab.Navigator>

//       {/* AskUsModal'ı burada kullanıyoruz */}
//       <AskUsModal
//         isOpen={isModalOpen}
    
//         withInput={true}
//       >
//         <Text>E-posta: </Text>
//         <TextInput placeholder="E-posta adresiniz" />
//         <Text>Telefon: </Text>
//         <TextInput placeholder="Telefon numaranız" />
//         <Text>Ad Soyad: </Text>
//         <TextInput placeholder="Adınızı ve soyadınızı girin" />
//         <Text>Soru: </Text>
//         <TextInput placeholder="Sorunuzu buraya yazın" />
//       </AskUsModal>
//     </>
//   );
// }

// // HomeScreen bileşeni
// const HomeScreen = () => {
//   return (
//     <WebView
//       source={{ uri: 'https://angelhousewedding.com/' }}
//       style={{ flex: 1 }}
//       sharedCookiesEnabled={true}
//       javaScriptEnabled={true}
//       domStorageEnabled={true}
//       cacheMode="LOAD_NO_CACHE"
//     />
//   );
// };

// // AppointmentCardScreen bileşeni
// const AppointmentCardScreen = () => {
//   return (
//     <WebView
//       source={{ uri: 'https://angelhousewedding.com/randevu-karti' }}
//       style={{ flex: 1 }}
//     />
//   );
// };

// // AccountScreen bileşeni
// const AccountScreen = () => {
//   const [userToken, setUserToken] = useState<string | null>(null);

//   useEffect(() => {
//     const loadToken = async () => {
//       const token = await AsyncStorage.getItem('userToken');
//       setUserToken(token);
//     };
//     loadToken();
//   }, []);

//   return (
//     <WebView
//       source={{
//         uri: userToken ? 'https://angelhousewedding.com/hesabim' : 'https://angelhousewedding.com/uye-girisi/',
//       }}
//       style={{ flex: 1 }}
//     />
//   );
// };

// // CreateAppointmentScreen bileşeni
// const CreateAppointmentScreen = () => {
//   return (
//     <WebView
//       source={{ uri: 'https://angelhousewedding.com/randevu-al/' }}
//       style={{ flex: 1 }}
//     />
//   );
// };
