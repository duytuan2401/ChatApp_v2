import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { signOut } from "firebase/auth";
import { firebaseAuth, firestoreDB } from "../config/firebase.config";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";

const ProfileScreen = ({ route }) => {
  const [userProfile, setUserProfile] = useState(null);
  const navigation = useNavigation();
  const user = useSelector((state) => state.user.user);
  const { userProfileData } = route.params; // Receiving the data from SettingChatScreen
  const currentUser = useSelector((state) => state.user.user);

  useEffect(() => {
    console.log("data:", userProfileData);
    if (userProfileData) {
      setUserProfile(userProfileData);
    } else {
      // Load user profile based on userId if no data passed
      const fetchUserProfile = async () => {
        try {
          const userProfileDoc = await getDoc(
            doc(firestoreDB, "users", user.id)
          );
          if (userProfileDoc.exists()) {
            setUserProfile(userProfileDoc.data());
          } else {
            console.error("User profile not found for userId:", user.id);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error.message);
        }
      };

      fetchUserProfile();
    }
  }, [userProfileData]);

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
      navigation.navigate("LoginScreen");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        // alignItems: "center",
        // // justifyContent: "flex-start",
      }}
    >
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "flex-start",
          paddingHorizontal: 20,
          paddingVertical: 35,
          backgroundColor: "#8A2BE2",
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="chevron-left" size={32} color="#333" />
        </TouchableOpacity>
        <Text style={{ fontSize: 28, color: "#333" }}>Profile</Text>
        {/* <TouchableOpacity>
          <Entypo name="dots-three-vertical" size={24} color="#333" />
        </TouchableOpacity> */}
      </View>

      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 20,
        }}
      >
        <Image
          source={{ uri: userProfile?.profilePic }}
          style={{ width: 70, height: 70, borderRadius: 32 }}
          resizeMode="contain"
        />
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "black",
            paddingTop: 3,
          }}
        >
          {userProfile?.fullName}
        </Text>
        {/* <Text style={{ fontSize: 20, fontWeight: "bold", color: "black" }}>
          {userProfile?.providerData.email}
        </Text> */}
      </View>

      {/* Media Share Section */}
      <View
        style={{
          width: "95%",
          // paddingHorizontal: 6,
          // paddingVertical: 4,
          // marginBottom: 12,
          // marginTop: 12,
          // marginLeft: 12,
          // marginRight: 12,
          margin: 12,
          borderBottomColor: "black",
          borderBottomWidth: 1,
        }}
      >
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "black" }}>
            Media Share
          </Text>
          <TouchableOpacity>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                // textTransform: "uppercase",
                color: "black",
              }}
            >
              View All
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            style={{
              width: 100,
              height: 100,
              margin: 10,
              borderRadius: 10,
              backgroundColor: "#ccc",
              overflow: "hidden",
            }}
          >
            <Image
              source={{
                uri: "https://images.app.goo.gl/xrjAdGxA7vDP7H9A9",
              }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 100,
              height: 100,
              margin: 10,
              borderRadius: 10,
              backgroundColor: "#ccc",
              overflow: "hidden",
            }}
          >
            <Image
              source={{
                uri: "https://images.app.goo.gl/xrjAdGxA7vDP7H9A9",
              }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 100,
              height: 100,
              margin: 10,
              borderRadius: 10,
              backgroundColor: "#ccc",
              overflow: "hidden",
            }}
          >
            <Image
              source={{
                uri: "https://images.app.goo.gl/xrjAdGxA7vDP7H9A9",
              }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
            <View
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#5A5650",
              }}
            >
              <Text
                style={{ fontSize: 16, color: "white", fontWeight: "bold" }}
              >
                250+
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {/* setting options */}
      {/* <View
        style={{
          width: "100%",
          paddingHorizontal: 6,
          paddingVertical: 4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons name="security" size={24} color="#555" />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "black",
              paddingLeft: 3,
            }}
          >
            Privacy
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={32} color="#555" />
      </View> */}

      {/* <View
        style={{
          width: "100%",
          paddingHorizontal: 6,
          paddingVertical: 4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons name="message" size={24} color="#555" />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "black",
              paddingLeft: 3,
            }}
          >
            Group
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={32} color="#555" />
      </View> */}

      {/* <View
        style={{
          width: "100%",
          paddingHorizontal: 6,
          paddingVertical: 4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons name="music-note" size={24} color="#555" />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "black",
              paddingLeft: 3,
            }}
          >
            Media's & Downloads
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={32} color="#555" />
      </View> */}

      <View
        style={{
          width: "100%",
          paddingHorizontal: 6,
          paddingVertical: 4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderBottomColor: "black",
            borderBottomWidth: 1,
            width: "100%",
          }}
        >
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("AccountScreen", {
                userAccountData: userProfileData,
              })
            }
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <MaterialIcons name="person" size={24} color="#555" />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "black",
                paddingLeft: 3,
              }}
            >
              Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          width: "100%",
          paddingHorizontal: 6,
          paddingVertical: 4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: "red",
            paddingLeft: 3,
            fontWeight: "bold",
          }}
        >
          Logout
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ProfileScreen;
