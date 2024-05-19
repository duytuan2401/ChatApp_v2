import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { BGImage, Logo, Avatar } from "../assets";
import { UserTextInput } from "../components";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
// import { BlurView } from "expo-blur";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { firebaseAuth, firestoreDB } from "../config/firebase.config";
import { doc, setDoc } from "firebase/firestore";
import * as FileSystem from "expo-file-system";
import { firebase } from "../config/firebase.config";
export default function SignUpScreen() {
  const screenWidth = Math.round(Dimensions.get("window").width);
  const screenHeight = Math.round(Dimensions.get("window").height);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [getEmailValidationStatus, setGetEmailValidationStatus] =
    useState(false);
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
      }
    })();
  }, []);

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };
  const uploadAvatar = async () => {
    try {
      if (avatar) {
        const { uri } = await FileSystem.getInfoAsync(avatar);
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => {
            resolve(xhr.response);
          };
          xhr.onerror = (e) => {
            reject(new TypeError("Network request failed"));
          };
          xhr.responseType = "blob";
          xhr.open("GET", uri, true);
          xhr.send(null);
        });
        const fileName = avatar.substring(avatar.lastIndexOf("/") + 1);
        const ref = firebase.storage().ref().child(fileName);

        await ref.put(blob);

        const downloadUrl = await ref.getDownloadURL();
        return downloadUrl;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return null;
    }
  };

  const handleSignUp = async () => {
    if (getEmailValidationStatus && email !== "") {
      const avatarUrl = await uploadAvatar();
      if (avatarUrl) {
        await createUserWithEmailAndPassword(firebaseAuth, email, password)
          .then(async (userCred) => {
            await sendEmailVerification(firebaseAuth.currentUser);

            const data = {
              _id: userCred.user.uid,
              fullName: name,
              profilePic: avatarUrl,
              providerData: userCred.user.providerData[0],
            };

            await setDoc(doc(firestoreDB, "users", userCred.user.uid), data);
            navigation.navigate("LoginScreen");
          })
          .catch((err) => {
            console.log("Error creating user:", err.message);
            if (err.message.includes("(auth/invalid-email)")) {
              setAlert(true);
              setAlertMessage("Invalid Email Address");
            }
            if (err.message.includes("(auth/weak-password)")) {
              setAlert(true);
              setAlertMessage("Password should be at least 6 characters long.");
            }
            if (err.message.includes("(auth/email-already-in-use)")) {
              setAlert(true);
              setAlertMessage("Email already in use");
            }

            setTimeout(() => {
              setAlert(false);
            }, 5000);
          });
      } else {
        // Handle error when avatar upload fails
        console.log("Error uploading avatar");
      }
    }
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
            paddingVertical: 8,
            color: "black",
            fontSize: 30,
            fontWeight: "600",
          }}
        >
          Sign Up
        </Text>
        {alert && (
          <Text style={{ fontSize: 16, color: "#ff0000" }}>{alertMessage}</Text>
        )}
        {/* Avatar sections */}
        <View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          <TouchableOpacity
            onPress={handlePickAvatar}
            style={{
              width: 80,
              height: 80,
              borderRadius: 80,
              borderWidth: 3,
              borderColor: "white",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={{ width: 70, height: 70 }}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={Avatar}
                style={{ width: 70, height: 70 }}
                resizeMode="cover"
              />
            )}
            <View
              style={{
                width: 25,
                height: 25,
                backgroundColor: "green",
                borderRadius: 10,
                position: "absolute",
                top: 0,
                right: 0,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="edit" size={24} color={"#fff"} />
            </View>
          </TouchableOpacity>
        </View>

        <View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UserTextInput
            placeholder="Username"
            isPass={false}
            setStatValue={setName}
          />

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
            onPress={handleSignUp}
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
            <Text style={{ color: "white", fontSize: 18 }}>Sign Up</Text>
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
              Have an account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("LoginScreen")}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "#007bff" }}
              >
                {" "}
                Login Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
