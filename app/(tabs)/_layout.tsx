import React, {useState} from 'react';
import { StyleSheet, Dimensions,View , Platform} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons'; // Feather yerine

// COMPONENTLERİN DOĞRU ŞEKİLDE İMPORT EDİLİYOR
import HomeScreen from './HomeScreen';
import AppointmentCardScreen from './AppointmentCardScreen';
import AskScreen from './AskScreen';
import CreateAppointmentScreen from './CreateAppointmentScreen';
import AccountScreen from './AccountScreen';
import AskUsModal from './AskUsModal';

const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

export default function Layout() {
   const [isModalVisible, setIsModalVisible] = useState(false);
  return (
    <>
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
         // 🔽 YENİ EKLENEN KISIM
    tabBarLabelStyle: {
      fontSize: 11,
      flexWrap: 'wrap',
      textAlign: 'center',
      justifyContent:'center',
      width: 90,
    },
    tabBarItemStyle: {
      width: 80,
      padding:7
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
                marginBottom: Platform.OS === 'android' ? 40 : 40, // navbar üstüne taşır
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 8, // Android gölgesi
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
      <Tab.Screen name="Randevu Oluştur" component={AppointmentCardScreen}/>
      <Tab.Screen name="Bize Sor"
          component={() => <View />} // Boş bir bileşen döndür
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setIsModalVisible(true); // Modalı aç
            },
          }} />
      <Tab.Screen name="Prova Kartı" component={CreateAppointmentScreen} />
      <Tab.Screen name="Hesabım" component={AccountScreen} />
    </Tab.Navigator>
    
    <AskUsModal visible={isModalVisible} onClose={() => setIsModalVisible(false)}  ></AskUsModal>
    </>
  );
}

























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
