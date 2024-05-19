import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  HomeScreen,
  LoginScreen,
  SignUpScreen,
  SplashScreen,
  AddToChatScreen,
  ChatScreen,
  GroupChatScreen,
  SettingChatScreen,
  SettingGroupChatScreen,
  ProfileScreen,
  AccountScreen,
} from "./screens";
import { Provider } from "react-redux";
import Store from "./context/store";
// import ProfileScreen from "./screens/ProfileScreen";
// import AccountScreen from "./screens/AccountScreen";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Provider store={Store}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="AddToChatScreen" component={AddToChatScreen} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="GroupChatScreen" component={GroupChatScreen} />
          <Stack.Screen
            name="SettingChatScreen"
            component={SettingChatScreen}
          />
          <Stack.Screen
            name="SettingGroupChatScreen"
            component={SettingGroupChatScreen}
          />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="AccountScreen" component={AccountScreen} />
        </Stack.Navigator>
      </Provider>
    </NavigationContainer>
  );
};

export default App;
