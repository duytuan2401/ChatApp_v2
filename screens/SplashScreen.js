import { View, Text, Image, ActivityIndicator } from "react-native";
import React, { useLayoutEffect } from "react";
import { Logo } from "../assets";
import { firebaseAuth, firestoreDB } from "../config/firebase.config";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { SET_USER } from "../context/actions/userActions";
import { doc, getDoc } from "firebase/firestore";

export default function SplashScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  useLayoutEffect(() => {
    checkLoggedUser();
  }, []);

  const checkLoggedUser = async () => {
    firebaseAuth.onAuthStateChanged((userCred) => {
      if (userCred?.uid) {
        getDoc(doc(firestoreDB, "users", userCred?.uid))
          .then((docSnap) => {
            if (docSnap.exists()) {
              console.log("User Data: ", docSnap.data());
              dispatch(SET_USER(docSnap.data()));
            }
          })
          .then(() => {
            setTimeout(() => {
              navigation.replace("LoginScreen");
            }, 2000);
          });
      } else {
        navigation.replace("LoginScreen");
      }
    });
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 24,
      }}
    >
      <Image
        source={Logo}
        style={{ width: 100, height: 100 }}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#43C651" />
    </View>
  );
}
