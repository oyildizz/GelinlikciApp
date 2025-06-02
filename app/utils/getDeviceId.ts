import * as SecureStore from "expo-secure-store";
import * as Device from "expo-device";

export const getDeviceId = async (): Promise<string> => {
  const key = "uniqueDeviceId";

  let id = await SecureStore.getItemAsync(key);

  if (!id) {
    const generatedId = (Device.osInternalBuildId || Device.modelId || Date.now().toString()) + "_" + Math.random().toString(36).substring(2);
    await SecureStore.setItemAsync(key, generatedId);
    id = generatedId;
  }

  return id;
};
