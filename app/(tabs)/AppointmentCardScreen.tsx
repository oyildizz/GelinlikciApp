import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Alert,
  StyleSheet,
  Switch,
  TouchableOpacity
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import * as Notifications from 'expo-notifications';

const saatSecenekleri = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00'
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

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);

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
    const zamanlar = [24 * 60 * 60 * 1000, 2 * 60 * 60 * 1000]; // 1 gün ve 2 saat
    const suAn = new Date();

    for (const fark of zamanlar) {
      const hedefTarih = getBildirimZamani(fark);
      const farkInSeconds = Math.floor((hedefTarih.getTime() - suAn.getTime()) / 1000);

      if (farkInSeconds <= 0) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Randevunuz Yaklaşıyor!',
          body: fark === zamanlar[0]
            ? 'Prova randevunuz yarın saat ${saat} te. Hatırlatmak istedik.'
            : 'Prova randevunuz 2 saat sonra başlıyor.',
        },
        trigger: {
          type: 'timeInterval',
          seconds: farkInSeconds,
          repeats: false,
        } as any,
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
        name,
        phone,
        email,
        tarih: tarih.toISOString().split('T')[0],
        saat,
        notlar,
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Adınız ve Soyadınız *</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

      <Text style={styles.label}>Telefon Numaranız *</Text>
      <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />

      <Text style={styles.label}>E-Posta Adresiniz *</Text>
      <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />

      <Text style={styles.label}>Ziyaret Tarihiniz *</Text>
      <Button title={tarih.toLocaleDateString()} onPress={() => setShowDate(true)} />
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

      <Text style={styles.label}>Ziyaret Saati *</Text>
      <TouchableOpacity
        style={[styles.input, { padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 4 }]}
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
            }} style={{ padding: 10, backgroundColor: '#f0f0f0', marginVertical: 2, borderRadius: 4 }}>
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
        style={[styles.input, { height: 100 }]}
        placeholder="Beğendiğiniz modellerin stok numarasını buraya yazabilirsiniz"
      />

      <View style={styles.checkboxContainer}>
        <Switch value={onay} onValueChange={setOnay} />
        <Text style={styles.checkboxLabel}>Bilgileri Onaylıyorum *</Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="Randevu Al" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    marginTop: 15,
    fontWeight: 'bold',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 6,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  checkboxLabel: {
    marginLeft: 10,
  },
});

export default RandevuForm;
