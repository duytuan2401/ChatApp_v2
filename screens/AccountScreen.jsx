import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { sendPasswordResetEmail } from "firebase/auth";
import { firebaseAuth, firestoreDB } from "../config/firebase.config";
import { UserTextInput } from "../components";
import { doc, updateDoc } from "firebase/firestore";
import { updateEmail, getAuth } from "firebase/auth";

const AccountScreen = ({ route }) => {
  const navigation = useNavigation();
  const user = useSelector((state) => state.user.user);
  const { userAccountData } = route.params; // Receiving the data from SettingChatScreen
  const [userAccount, setUserAccount] = useState(null);
  const [alert, setAlert] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false); // State for controlling the visibility of the alert modal
  const [alertMessage, setAlertMessage] = useState(""); // State for storing the alert message
  // const [alertMessage, setAlertMessage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    console.log("data:", userAccountData);
    if (userAccountData) {
      setUserAccount(userAccountData);
    } else {
      // Load user profile based on userId if no data passed
      const fetchUserProfile = async () => {
        try {
          const userAccountDoc = await getDoc(
            doc(firestoreDB, "users", user.id)
          );
          if (userAccountDoc.exists()) {
            setUserAccount(userAccountDoc.data());
          } else {
            console.error("User profile not found for userId:", user.id);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error.message);
        }
      };

      fetchUserProfile();
    }
  }, [userAccountData]);

  const changePassword = () => {
    sendPasswordResetEmail(firebaseAuth, userAccount?.providerData.email)
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
  const confirmChangePassword = () => {
    Alert.alert("Confirm", "Are you sure you want to change the password?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => setAlertVisible(false),
      },
      {
        text: "Change",
        onPress: () => {
          setAlertVisible(true); // Hiển thị modal
          changePassword();
        },
      },
    ]);
  };

  // Hàm xử lý chỉnh sửa thông tin người dùng
  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  // Hàm xử lý lưu thông tin đã chỉnh sửa
  // const handleSaveChanges = () => {
  //   // Xử lý dữ liệu đã chỉnh sửa và gửi yêu cầu cập nhật thông tin người dùng
  //   // Sau đó đóng modal chỉnh sửa
  //   setShowEditModal(false);
  // };
  const handleSaveChanges = async () => {
    console.log("data:", userAccountData);
    console.log("name:", name);
    console.log("email:", email);
    try {
      const newProviderData = {
        ...userAccount.providerData,
        email: email,
        uid: email, // Giả sử `uid` cũng là `email`, điều này tùy thuộc vào logic của bạn.
      };

      const newData = {
        fullName: name,
        providerData: newProviderData,
      };

      await updateDoc(doc(firestoreDB, "users", user._id), newData);

      // Hiển thị thông báo hoàn thành
      setAlertMessage("Profile updated successfully");
      setAlertVisible(true);

      // Đóng modal chỉnh sửa
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating profile:", error.message);
      // Hiển thị thông báo lỗi nếu cập nhật không thành công
      setAlertMessage("Failed to update profile, please try again later");
      setAlertVisible(true);
    }
  };
  // const handleSaveChanges = async () => {
  //   console.log("data:", userAccountData);
  //   console.log("name:", name);
  //   console.log("email:", email);

  //   const auth = getAuth();

  //   if (!user || !user._id) {
  //     setAlertMessage("User data is not available");
  //     setAlertVisible(true);
  //     return;
  //   }

  //   if (!userAccount) {
  //     setAlertMessage("User account data is not available");
  //     setAlertVisible(true);
  //     return;
  //   }

  //   try {
  //     // Cập nhật email trong Firebase Authentication
  //     if (email !== user.email) {
  //       await updateEmail(auth.currentUser, email);
  //     }

  //     const newProviderData = {
  //       ...userAccount.providerData,
  //       email: email,
  //       uid: email, // Giả sử `uid` cũng là `email`, điều này tùy thuộc vào logic của bạn.
  //     };

  //     const newData = {
  //       fullName: name,
  //       providerData: newProviderData,
  //     };

  //     await updateDoc(doc(firestoreDB, "users", user._id), newData);

  //     // Hiển thị thông báo hoàn thành
  //     setAlertMessage("Profile updated successfully");
  //     setAlertVisible(true);

  //     // Đóng modal chỉnh sửa
  //     setShowEditModal(false);
  //   } catch (error) {
  //     console.error("Error updating profile:", error.message);
  //     // Hiển thị thông báo lỗi nếu cập nhật không thành công
  //     setAlertMessage("Failed to update profile, please try again later");
  //     setAlertVisible(true);
  //   }
  // };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "flex-start",
        // justifyContent: "flex-start",
      }}
    >
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          // paddingHorizontal: 20,
          // paddingVertical: 40,
          backgroundColor: "#8A2BE2",
          padding: 20,
          paddingTop: 30,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="chevron-left" size={32} color="#333" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, color: "#333" }}>Options</Text>
      </View>
      <TouchableOpacity
        onPress={confirmChangePassword}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 20,
          paddingHorizontal: 20,
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
          <Ionicons name="lock-open-outline" size={24} color="#555" />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "black",
              paddingLeft: 10,
            }}
          >
            Change Password
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleEditProfile}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 20,
          paddingHorizontal: 20,
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
          <Ionicons name="pencil" size={24} color="#555" />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "black",
              paddingLeft: 10,
            }}
          >
            Edit Profile
          </Text>
        </View>
      </TouchableOpacity>
      <Modal visible={alertVisible} transparent={true}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
            }}
          >
            <Text>{alertMessage}</Text>
            <TouchableOpacity onPress={() => setAlertVisible(false)}>
              <Text style={{ marginTop: 10, color: "blue" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showEditModal} animationType="slide">
        {/* Biểu mẫu chỉnh sửa thông tin */}
        <View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TextInput
            placeholder="Username"
            value={name}
            onChangeText={(text) => setName(text)}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
          />
        </View>
        {/* Nút lưu thay đổi */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <TouchableOpacity
            onPress={handleSaveChanges}
            style={{
              backgroundColor: "#8A2BE2",
              borderRadius: 5,
              paddingVertical: 12,
              paddingHorizontal: 20,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              Save Changes
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AccountScreen;
