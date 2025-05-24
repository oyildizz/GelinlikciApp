import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  if (!Device.isDevice) return null;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
};
