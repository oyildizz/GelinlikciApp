import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveLocalAppointment = async (appointment: any) => {
  if (!appointment || typeof appointment !== 'object') return;

  try {
    const stored = await AsyncStorage.getItem('localAppointments');
    const list = stored ? JSON.parse(stored) : [];
    list.push(appointment);
    await AsyncStorage.setItem('localAppointments', JSON.stringify(list));
  } catch (e) {
    console.log('Randevu kaydı hatası:', e);
  }
};

export const getLocalAppointments = async () => {
  const stored = await AsyncStorage.getItem('localAppointments');
  return stored ? JSON.parse(stored) : [];
};
