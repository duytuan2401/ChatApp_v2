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
import { updateDoc } from "firebase/firestore";
import { getDocs, collection } from "firebase/firestore";
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

  // const toggleAvailableUsers = () => {
  //   setShowAvailableUsers(!showAvailableUsers);
  // };

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

  const renderItem2 = ({ item }) => (
    <View style={styles.memberItemContainer}>
      <TouchableOpacity
        style={styles.memberItem}
        onPress={() => navigateToProfile(item._id)}
      >
        <Image
          source={{ uri: item.profilePic }}
          style={styles.memberItemImage}
        />
        <Text style={styles.memberItemText}>{item.fullName}</Text>
      </TouchableOpacity>
      {room.owner._id === currentUser._id && currentUser._id !== item._id && (
        <View style={styles.ownerActions}>
          <TouchableOpacity onPress={() => handleTransferOwnership(item._id)}>
            <FontAwesome
              name="long-arrow-right"
              size={24}
              color="#333"
              style={styles.ownerActionIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeParticipant(item._id)}>
            <FontAwesome name="trash" size={24} color="red" />
          </TouchableOpacity>
        </View>
      )}
      {room.owner._id === currentUser._id && currentUser._id === item._id && (
        <View style={styles.ownerLabel}>
          <Text>Owner</Text>
        </View>
      )}
      {room.owner._id !== currentUser._id && room.owner._id === item._id && (
        <View style={styles.ownerLabel}>
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

  return (
    <View style={{ flex: 1, paddingVertical: 30 }}>
      <View
        style={{
          backgroundColor: "#8A2BE2",
          paddingVertical: 20,
          paddingHorizontal: 20,
        }}
      >
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
          <Text style={{ fontSize: 20, color: "#333" }}>Options</Text>
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
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 20,
            // borderBottomColor: "#333",
            // borderBottomWidth: 1,
          }}
        >
          <Image
            source={{ uri: room.participants[1].profilePic }}
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              marginRight: 10,
              borderColor: "#ddd",
              borderWidth: 1,
            }}
          />
          <Text style={{ fontSize: 20 }}>{room.participants[1].fullName}</Text>
        </View>
      </TouchableOpacity>
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderBottomColor: "black",
            borderBottomWidth: 1,
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onPress={toggleMembers}
          >
            <MaterialIcons name="people" size={24} color="#555" />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "black",
                paddingLeft: 10,
              }}
            >
              Members
            </Text>
          </TouchableOpacity>
          <MaterialIcons name="keyboard-arrow-down" size={32} color="#555" />
        </View>
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
          width: "100%",
          paddingHorizontal: 12,

          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderBottomColor: "black",
            borderBottomWidth: 1,
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onPress={() => navigation.navigate("MediaScreen", { room: room })}
          >
            <MaterialIcons name="music-note" size={24} color="#555" />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "black",
                paddingLeft: 10,
              }}
            >
              Media & Download
            </Text>
          </TouchableOpacity>
          <MaterialIcons name="chevron-right" size={32} color="#555" />
        </View>
      </View>
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
  memberItemContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginVertical: 5,
    paddingVertical: 10,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberItemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  memberItemText: {
    fontSize: 16,
  },
  ownerActions: {
    flexDirection: "row",
  },
  ownerActionIcon: {
    marginRight: 10,
  },
  ownerLabel: {
    flexDirection: "row",
  },
});

export default SettingChatScreen;
