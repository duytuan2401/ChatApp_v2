import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  StyleSheet,
  Button,
} from "react-native";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { signOut } from "firebase/auth";
import { firebaseAuth, firestoreDB } from "../config/firebase.config";
import { useNavigation } from "@react-navigation/native";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const ProfileScreen = ({ route }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [groups, setGroups] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const user = useSelector((state) => state.user.user);
  const { userProfileData } = route.params;

  useEffect(() => {
    if (userProfileData) {
      setUserProfile(userProfileData);
    } else {
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

    const fetchUserGroups = async () => {
      try {
        const groupChatQuerySnapshot = await getDocs(
          query(
            collection(firestoreDB, "groupChats"),
            where("participants", "array-contains", user)
          )
        );

        const groupChatData = groupChatQuerySnapshot.docs.map((doc) =>
          doc.data()
        );
        setGroups(groupChatData);
      } catch (error) {
        console.error("Error fetching user groups:", error.message);
      }
    };

    fetchUserGroups();
  }, [userProfileData]);

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
      navigation.navigate("LoginScreen");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  const renderGroupItem = ({ item }) => (
    <View style={styles.groupItem}>
      <Text style={styles.groupName}>{item.chatName}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="chevron-left" size={32} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      <View style={styles.profileInfo}>
        <Image
          source={{ uri: userProfile?.profilePic }}
          style={styles.profilePic}
          resizeMode="contain"
        />
        <Text style={styles.profileName}>{userProfile?.fullName}</Text>
      </View>

      <View style={styles.settingOption}>
        <View style={styles.optionContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons name="message" size={24} color="#555" />
            <Text style={styles.optionText}>Group</Text>
          </TouchableOpacity>
          <MaterialIcons name="chevron-right" size={32} color="#555" />
        </View>
      </View>
      {/* <View style={styles.settingOption}>
        <View style={styles.optionContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => navigation.navigate("MediaScreen", { room: room })}
          >
            <MaterialIcons name="music-note" size={24} color="#555" />
            <Text style={styles.optionText}>Media & Downloaded</Text>
          </TouchableOpacity>
          <MaterialIcons name="chevron-right" size={32} color="#555" />
        </View>
      </View> */}
      <View style={styles.settingOption}>
        <View style={styles.optionContainer}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("AccountScreen", {
                userAccountData: userProfileData,
              })
            }
            style={styles.optionButton}
          >
            <MaterialIcons name="person" size={24} color="#555" />
            <Text style={styles.optionText}>Account</Text>
          </TouchableOpacity>
          <MaterialIcons name="chevron-right" size={32} color="#555" />
        </View>
      </View>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Groups</Text>
          <FlatList
            data={groups}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item._id}
          />
          <Button
            title="Close"
            onPress={() => setModalVisible(!modalVisible)}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 30,
    backgroundColor: "#8A2BE2",
  },
  headerText: {
    fontSize: 20,
    color: "#333",
  },
  profileInfo: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
  },
  profilePic: {
    width: 70,
    height: 70,
    borderRadius: 32,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    paddingTop: 3,
  },
  settingOption: {
    width: "100%",
    paddingHorizontal: 6,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    justifyContent: "space-between",
    width: "100%",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    paddingLeft: 10,
  },
  logoutButton: {
    width: "100%",
    paddingHorizontal: 6,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "red",
    paddingLeft: 3,
  },
  modalView: {
    margin: 70,
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    padding: 50,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    // marginBottom: 15,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
  },
  groupItem: {
    padding: 10,
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  groupName: {
    fontSize: 20,
  },
});

export default ProfileScreen;
