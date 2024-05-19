import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Logo } from "../assets";
import { BGImage } from "../assets";
import { UserTextInput } from "../components";
import { useNavigation } from "@react-navigation/native";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { firebaseAuth, firestoreDB } from "../config/firebase.config";
import { doc, getDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { SET_USER } from "../context/actions/userActions";

export default function LoginScreen() {
  const screenWidth = Math.round(Dimensions.get("window").width);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [getEmailValidationStatus, setGetEmailValidationStatus] =
    useState(false);
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (getEmailValidationStatus && email !== "") {
      await signInWithEmailAndPassword(firebaseAuth, email, password)
        .then((userCred) => {
          if (userCred) {
            console.log("User Id:", userCred?.user.uid);
            getDoc(doc(firestoreDB, "users", userCred?.user.uid))
              .then((docSnap) => {
                if (docSnap.exists()) {
                  console.log("User Data: ", docSnap.data());
                  dispatch(SET_USER(docSnap.data()));
                }
              })
              .then(() => {
                setTimeout(() => {
                  navigation.replace("HomeScreen");
                }, 2000);
              });
          }
        })
        .catch((err) => {
          console.log("Error: ", err.message);
          if (err.message.includes("(auth/invalid-credential)")) {
            setAlert(true);
            setAlertMessage("Invalid Email or Password");
          }
          if (err.message.includes("(auth/invalid-email)")) {
            setAlert(true);
            setAlertMessage("Invalid Email Address");
          }
          if (err.message.includes("(auth/weak-password)")) {
            setAlert(true);
            setAlertMessage("Password should be at least 6 characters long.");
          }
          if (err.message.includes("(auth/missing-email)")) {
            setAlert(true);
            setAlertMessage("Missing email");
          }
          setInterval(() => {
            setAlert(false);
          }, 5000);
        });
    }
  };

  const forgetPassword = () => {
    sendPasswordResetEmail(firebaseAuth, email)
      .then(() => {
        setAlert(true);
        setAlertMessage("Please check your email to reset your password");
      })
      .catch((error) => {
        console.error("Error sending password reset email:", error);
        setAlert(true);
        setAlertMessage("Please enter your email");
      });
  };

  return (
    <View
      style={{ flex: 1, alignItems: "center", justifyContent: "flex-start" }}
    >
      <Image
        source={BGImage}
        resizeMode="cover"
        style={{ height: 250, width: screenWidth }}
      />

      {/* Main View */}
      <View
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "white",
          borderTopLeftRadius: 90,
          marginTop: -44,
          alignItems: "center",
          justifyContent: "flex-start",
          paddingVertical: 20,
          paddingHorizontal: 50,
          spaceY: 6,
          borderColor: "#3498db",
          borderWidth: 2,
        }}
      >
        {/* <Image
          source={Logo}
          style={{ width: 70, height: 70 }}
          resizeMode="cover"
        /> */}

        <Text
          style={{
            paddingVertical: 20,
            color: "black",
            fontSize: 30,
            fontWeight: "600",
          }}
        >
          Sign In
        </Text>

        <View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* alert */}
          {alert && (
            <Text style={{ fontSize: 16, color: "#ff0000" }}>
              {alertMessage}
            </Text>
          )}

          <UserTextInput
            placeholder="Email"
            isPass={false}
            setStatValue={setEmail}
            setGetEmailValidationStatus={setGetEmailValidationStatus}
          />
          <UserTextInput
            placeholder="Password"
            isPass={true}
            setStatValue={setPassword}
          />

          <TouchableOpacity
            onPress={handleLogin}
            style={{
              width: "80%",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: "#3498db",
              marginVertical: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 18 }}>Sign In</Text>
          </TouchableOpacity>
          <View
            style={{
              width: "100%",
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 18, color: "#333" }}>
              Don't have an account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("SignUpScreen")}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "#007bff" }}
              >
                {" "}
                Create Here
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              width: "100%",
              paddingVertical: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity onPress={forgetPassword}>
              <Text style={{ color: "#333", fontSize: 18 }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
