import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, Button, ScrollView, Alert,
  StyleSheet, Switch, TouchableOpacity, Pressable, Dimensions, Image
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import * as Notifications from 'expo-notifications';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/build/FontAwesome';
import * as Font from 'expo-font';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';

const screenWidth = Dimensions.get('window').width;

const saatSecenekleri = [
  '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00'
];

const RandevuForm = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tarih, setTarih] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [saat, setSaat] = useState('10:00');
  const [notlar, setNotlar] = useState('');
  const [onay, setOnay] = useState(false);
  const [showSaatSecenekleri, setShowSaatSecenekleri] = useState(false);
  const [activeWebUrl, setActiveWebUrl] = useState<string | null>(null);
  const [showToolbar, setShowToolbar] = useState(true);


  const [fontsLoaded] = useFonts({
  'ArialMdm': require('../../assets/fonts/ArialMdm.ttf'),
});


  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);

  const route = useRoute();
  const routeParams = route.params as { refresh?: number } | undefined;

  useFocusEffect(
    useCallback(() => {
      setActiveWebUrl(null);
      setShowToolbar(true);
    }, [routeParams?.refresh])
  );

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  const getBildirimZamani = (saatFark: number) => {
    const [saatStr, dakikaStr] = saat.split(':');
    const randevu = new Date(tarih);
    randevu.setHours(parseInt(saatStr));
    randevu.setMinutes(parseInt(dakikaStr));
    randevu.setSeconds(0);
    randevu.setMilliseconds(0);
    return new Date(randevu.getTime() - saatFark);
  };

  const bildirimGonder = async () => {
    const zamanlar = [86400000, 7200000];
    const suAn = new Date();

    for (const fark of zamanlar) {
      const hedefTarih = getBildirimZamani(fark);
      const farkInSeconds = Math.floor((hedefTarih.getTime() - suAn.getTime()) / 1000);
      if (farkInSeconds <= 0) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Randevunuz Yaklaşıyor!',
          body: fark === zamanlar[0]
            ? `Prova randevunuz yarın saat ${saat}’te. Hatırlatmak istedik.`
            : 'Prova randevunuz 2 saat sonra başlıyor.',
        },
        trigger: { type: 'timeInterval', seconds: farkInSeconds, repeats: false } as any,
      });
    }
  };

  const handleSubmit = async () => {
    if (!name || !phone || !email || !onay) {
      Alert.alert('Hata', 'Lütfen gerekli alanları doldurun ve onay kutusunu işaretleyin.');
      return;
    }

    if (tarih.setHours(0, 0, 0, 0) < bugun.getTime()) {
      Alert.alert('Hata', 'Geçmiş bir tarih seçilemez.');
      return;
    }

    try {
      await addDoc(collection(db, 'provaRandevular'), {
        name, phone, email,
        tarih: tarih.toISOString().split('T')[0],
        saat, notlar
      });

      await bildirimGonder();
      Alert.alert('Başarılı', 'Randevunuz oluşturuldu!');
      resetForm();
    } catch (err) {
      Alert.alert('Hata', 'Randevu kaydı sırasında bir hata oluştu.');
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setNotlar('');
    setOnay(false);
    setTarih(new Date());
    setSaat('10:00');
    setShowSaatSecenekleri(false);
  };

  const openWebPage = (url: string) => {
    setActiveWebUrl(url);
    setShowToolbar(false);
  };

  const closeWebView = () => {
    setActiveWebUrl(null);
    setShowToolbar(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {showToolbar && (
        <View style={styles.fullWidthToolbar}>

          <View style={styles.menuRow}>
            <Pressable onPress={() => openWebPage('https://angelhousewedding.com/giris')}><Text style={styles.menuItem}><FontAwesome name="user-circle" size={12} color="#666" style={{ marginRight: 5 }}  /> Giriş Yap / Kayıt Ol</Text></Pressable>
            <Pressable onPress={() => openWebPage('https://angelhousewedding.com/iletisim')}><Text style={styles.menuItem}>İletişim</Text></Pressable>
            <Pressable onPress={() => openWebPage('https://angelhousewedding.com/hakkimizda')}><Text style={styles.menuItem}>Hakkımızda</Text></Pressable>
            <Pressable onPress={closeWebView}><Text style={[styles.menuItem, styles.active]}>Prova Kartı</Text></Pressable>
          </View>
        </View>
      )}
 
      {activeWebUrl ? (
        <WebView source={{ uri: activeWebUrl }} style={{ flex: 1 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>

            <View style={styles.breadcrumbContainer}>
            <Text style={styles.breadcrumbText}>
              <Text style={styles.breadcrumbLink} onPress={() => openWebPage('https://angelhousewedding.com/giris')}>Anasayfa</Text>
              {' » '}
              <Text style={styles.breadcrumbActive}>Prova Kartı</Text>
            </Text>
            
          </View>
       <View style={styles.introContainer}>
  <Image
    source={require('../../assets/images/siziBekliyoruz.png')}
    style={styles.introImage}
    resizeMode="contain"
  />
</View>
<Text style={{color:'#5897a3', fontWeight:'bold', fontSize:18, paddingBottom:20}}>Prova Randevusu Al</Text>
          <View style={styles.innerContainer}>
            <Text style={styles.label}>Adınız ve Soyadınız <Text style={styles.required}>*</Text></Text>
            <TextInput value={name} onChangeText={setName} style={styles.textField} />

            <Text style={styles.label}>Telefon Numaranız <Text style={styles.required}>*</Text></Text>
            <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.textField} />

            <Text style={styles.label}>E-Posta Adresiniz <Text style={styles.required}>*</Text></Text>
            <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.textField} />

            <Text style={styles.label}>Ziyaret Tarihiniz <Text style={styles.required}>*</Text></Text>
            <View style={{}}><Button color="#5897a3" title={tarih.toLocaleDateString()} onPress={() => setShowDate(true)} /></View>

            {showDate && (
              <DateTimePicker
                value={tarih}
                minimumDate={bugun}
                mode="date"
                display="default"
                onChange={(e, selected) => {
                  setShowDate(false);
                  if (selected) setTarih(selected);
                }}
              />
            )}

            <Text style={styles.label}>Ziyaret Saati <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              style={[styles.textField, { justifyContent: 'center' }]}
              onPress={() => setShowSaatSecenekleri(!showSaatSecenekleri)}
            >
              <Text>{saat}</Text>
            </TouchableOpacity>

            {showSaatSecenekleri && (
              <View style={{ marginTop: 8, marginBottom: 12 }}>
                {saatSecenekleri.map((s) => (
                  <TouchableOpacity key={s} onPress={() => {
                    setSaat(s);
                    setShowSaatSecenekleri(false);
                  }} style={styles.dropdownItem}>
                    <Text style={{ textAlign: 'center' }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Paragraf Metni</Text>
            <TextInput
              value={notlar}
              onChangeText={setNotlar}
              multiline
              numberOfLines={4}
              style={[styles.textField, { height: 100 }]}
              placeholder="Beğendiğiniz modellerin stok numarasını buraya yazabilirsiniz"
            />

            <View style={styles.checkboxContainer}>
              <Switch value={onay} onValueChange={setOnay} />
              <Text style={styles.checkboxLabel}>Bilgileri Onaylıyorum <Text style={styles.required}>*</Text></Text>
            </View>

            <View style={styles.buttonContainer}>
              <Button color="#5897a3" title="Randevu Al" onPress={handleSubmit} />
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  breadcrumbContainer: {
    width:'90%'
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#444',
  },
  breadcrumbLink: {
    color: '#2e5e4e',

  },
  breadcrumbActive: {
    color: '#888',
  },
  headerImage: {
    width: 150,
    height: 50,
    marginTop: 10,
    alignSelf: 'center',
  },
  scrollContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  fullWidthToolbar: {
    width: '100%',
    backgroundColor: '#F8F8F8',
    borderBottomColor: '#F8F8F8',
    borderBottomWidth: 1,
    paddingVertical: 8,
    marginBottom: 10,
  },
  innerContainer: {
    width: '90%',
    maxWidth: 600,
  },
  menuRow: {
    flexDirection: 'row',
   justifyContent:'center',
    flexWrap: 'wrap',
  marginTop:20
  },
  menuItem: {
    fontSize: screenWidth < 400 ? 10 : 12,
    color: '#000',
    marginVertical: 4,
    paddingRight:10,
    paddingLeft:10,
    fontFamily:'ArialMdm'
    
  },
  active: {
    textDecorationLine: 'underline',
  },
  label: {
    marginTop: 15,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  required: {
    color: 'red'
  },
  textField: {
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownItem: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginVertical: 2,
    borderRadius: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  checkboxLabel: {
    marginLeft: 10,
  },
  buttonContainer: {
    marginTop: 20,
    borderRadius: 4,
    overflow: 'hidden'
  },
  introContainer: {
  marginTop: 10,
  marginBottom: 20,
  alignItems: 'center',
  paddingHorizontal: 20,
},
introImage: {
  
  height: 300,
},
});

export default RandevuForm;
