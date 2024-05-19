import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { firestoreDB } from "../config/firebase.config";
import { updateDoc, arrayRemove } from "firebase/firestore";
import { arrayUnion, getDocs, collection } from "firebase/firestore";
import { useSelector } from "react-redux";
import { CommonActions } from "@react-navigation/native";

const SettingChatScreen = ({ route }) => {
  const navigation = useNavigation();
  const { room } = route.params;
  const [showMembers, setShowMembers] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showAvailableUsers, setShowAvailableUsers] = useState(false);
  const currentUser = useSelector((state) => state.user.user);

  const [selectedMember, setSelectedMember] = useState(null); // State for selected member
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility

  const toggleAvailableUsers = () => {
    setShowAvailableUsers(!showAvailableUsers);
  };

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        const allUsersSnapshot = await getDocs(
          collection(firestoreDB, "users")
        );
        const allUsersData = allUsersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const alreadyInChat = room.participants.map(
          (participant) => participant._id
        );
        const newAvailableUsers = allUsersData.filter(
          (user) => !alreadyInChat.includes(user._id)
        );
        setAvailableUsers(newAvailableUsers);
      } catch (error) {
        console.error("Error fetching available users:", error);
      }
    };

    fetchAvailableUsers();
  }, [room.participants]);

  const toggleMembers = () => {
    setShowMembers(!showMembers);
  };

  const removeParticipant = async (userId) => {
    try {
      if (room.owner._id !== currentUser._id) {
        throw new Error("Only the owner can remove participants.");
      }

      const userRef = doc(firestoreDB, "users", userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      const updatedParticipants = room.participants.filter(
        (participant) => participant._id !== userId
      );

      await updateDoc(doc(firestoreDB, "groupChats", room._id), {
        participants: updatedParticipants,
      });

      route.params.room.participants = updatedParticipants;

      Alert.alert("Success", "User removed successfully");
    } catch (error) {
      Alert.alert(
        "Error",
        "You aren't owner group chat. Please try again later."
      );
    }
  };

  const navigateToProfile = async (userId) => {
    try {
      const userRef = doc(firestoreDB, "users", userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      setSelectedMember(userData);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const transferOwnership = async (newOwnerId) => {
    try {
      if (room.owner._id !== currentUser._id) {
        throw new Error("Only the owner can transfer ownership.");
      }

      const newOwnerRef = doc(firestoreDB, "users", newOwnerId);
      const newOwnerDoc = await getDoc(newOwnerRef);
      const newOwnerData = newOwnerDoc.data();

      await updateDoc(doc(firestoreDB, "groupChats", room._id), {
        owner: newOwnerData,
      });

      Alert.alert("Success", "Ownership transferred successfully");
    } catch (error) {
      console.error("Error transferring ownership:", error);
      Alert.alert(
        "Error",
        "Failed to transfer ownership. Please try again later."
      );
    }
  };

  const handleTransferOwnership = (userId) => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to transfer ownership to this user?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Transfer",
          onPress: () => transferOwnership(userId),
        },
      ]
    );
  };
  // const navigateToProfileScreen = (userId) => {
  //   navigation.navigate("ProfileScreen", { userId: userId });
  // };

  const renderItem2 = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        margin: 10,
      }}
    >
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center" }}
        onPress={() => navigateToProfile(item._id)}
      >
        <Image
          source={{ uri: item.profilePic }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 10,
            borderColor: "#ccc",
            borderWidth: 1,
          }}
        />
        <Text style={{ fontSize: 16 }}>{item.fullName}</Text>
      </TouchableOpacity>
      {room.owner._id === currentUser._id && currentUser._id !== item._id && (
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={() => handleTransferOwnership(item._id)}>
            <FontAwesome
              name="long-arrow-right"
              size={24}
              color="#333"
              style={{ marginRight: 10 }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeParticipant(item._id)}>
            <FontAwesome name="trash" size={24} color="red" />
          </TouchableOpacity>
        </View>
      )}
      {room.owner._id === currentUser._id && currentUser._id === item._id && (
        <View style={{ flexDirection: "row" }}>
          <Text>Owner</Text>
        </View>
      )}
      {room.owner._id !== currentUser._id && room.owner._id === item._id && (
        <View style={{ flexDirection: "row" }}>
          <Text>Owner</Text>
        </View>
      )}
    </View>
  );

  const dissolveChat = async () => {
    try {
      if (room.owner._id !== currentUser._id) {
        throw new Error("Only the owner can dissolve the chat.");
      }

      await updateDoc(doc(firestoreDB, "chats", room._id), {
        participants: [],
      });

      await deleteDoc(doc(firestoreDB, "chats", room._id));

      Alert.alert("Success", "Chat dissolved successfully");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "HomeScreen" }],
        })
      );
    } catch (error) {
      console.error("Error dissolving chat:", error);
      Alert.alert("Error", "Failed to dissolve chat. Please try again later.");
    }
  };
  const confirmDissolveChat = () => {
    Alert.alert("Confirm", "Are you sure you want to dissolve the chat?", [
      { text: "Cancel", style: "cancel" },
      { text: "Dissolve", onPress: () => dissolveChat() },
    ]);
  };

  // const deleteChat = async () => {
  //   try {
  //     if (room.owner._id !== currentUser._id) {
  //       throw new Error("Only the owner can delete the chat.");
  //     }

  //     await deleteDoc(doc(firestoreDB, "chats", room._id));

  //     Alert.alert("Success", "Chat deleted successfully");
  //   } catch (error) {
  //     console.error("Error deleting chat:", error);
  //     Alert.alert("Error", "Failed to delete chat. Please try again later.");
  //   }
  // };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ backgroundColor: "#8A2BE2", padding: 16, paddingTop: 50 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="chevron-left" size={32} color="#333" />
          </TouchableOpacity>
          <Text style={{ fontSize: 28, color: "#333" }}>Options</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("ProfileScreen", {
            userProfileData: room.participants[1],
          })
        }
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={{ uri: room.participants[1].profilePic }}
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              marginRight: 10,
              borderColor: "#ccc",
              borderWidth: 1,
            }}
          />
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 20 }}>{room.participants[1].fullName}</Text>
        </View>
      </TouchableOpacity>

      <View
        style={{
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={toggleMembers}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Members</Text>
        </TouchableOpacity>
      </View>

      {showMembers && (
        <FlatList
          data={room.participants}
          keyExtractor={(item) => item._id}
          renderItem={renderItem2}
        />
      )}

      <View
        style={{
          marginBottom: 10,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <TouchableOpacity onPress={confirmDissolveChat}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "red" }}>
            Dissolve The Chat
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            {selectedMember && (
              <>
                <Image
                  source={{ uri: selectedMember.profilePic }}
                  style={styles.modalImage}
                />
                <Text style={styles.modalText}>{selectedMember.fullName}</Text>
                <Text style={styles.modalText}>
                  Email: {selectedMember.providerData.email}
                </Text>
                {/* <Text style={styles.modalText}>
                  Phone: {selectedMember.phone}
                </Text> */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
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
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default SettingChatScreen;
