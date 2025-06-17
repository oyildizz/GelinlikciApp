import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { View, Platform, Keyboard } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import HomeScreen from "./HomeScreen";
import AppointmentCardScreen from "./AppointmentCardScreen";
import CreateAppointmentScreen from "./CreateAppointmentScreen";
import AccountScreen from "./AccountScreen";
import AskUsModal from "./AskUsModal";

const Tab = createBottomTabNavigator();

export default function Layout() {
  const [keyboardVisible, setKeyboardVisible] = React.useState(false);

  React.useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: keyboardVisible
          ? { display: "none" }
          : {
              backgroundColor: "#104438",
              height: 80,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "white",
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
          flexWrap: "wrap",
          textAlign: "center",
          justifyContent: "center",
          width: 90,
        },
        tabBarItemStyle: {
          width: 80,
          padding: 7,
        },
        tabBarIcon: ({ color }) => {
          let iconName: keyof typeof Feather.glyphMap = "home";

          if (route.name === "Ana Sayfa") iconName = "home";
          else if (route.name === "Randevu Al") iconName = "file-text";
          else if (route.name === "Bize Sor") iconName = "message-circle";
          else if (route.name === "Prova Oluştur") iconName = "calendar";
          else if (route.name === "Hesabım") iconName = "user";

          if (route.name === "Bize Sor") {
            return (
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 35,
                  width: 64,
                  height: 64,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: Platform.OS === "android" ? 40 : 40,
                  shadowColor: "#000",
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
      <Tab.Screen
        name="Ana Sayfa"
        component={HomeScreen}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate("Ana Sayfa", { goToUrl: "https://angelhousewedding.com/" });
          },
        })}
      />
      <Tab.Screen
        name="Randevu Al"
        component={CreateAppointmentScreen}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate("Randevu Al", { goToUrl: "https://angelhousewedding.com/randevu-al" });
          },
        })}
      />
      <Tab.Screen name="Bize Sor" component={AskUsModal} />
      <Tab.Screen
        name="Prova Oluştur"
        component={AppointmentCardScreen}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate("Prova Oluştur" as never, { goToUrl: null } as never);
          },
        })}
      />

      <Tab.Screen
        name="Hesabım"
        component={AccountScreen}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate("Hesabım", {
              goToUrl: "https://angelhousewedding.com/hesabim",
            });
          },
        })}
      />
    </Tab.Navigator>
  );
}
