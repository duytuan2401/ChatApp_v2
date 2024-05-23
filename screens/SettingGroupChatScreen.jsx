import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { firestoreDB } from "../config/firebase.config";
import { updateDoc, arrayRemove } from "firebase/firestore";
import { arrayUnion, getDocs, collection } from "firebase/firestore";
import { useSelector } from "react-redux";
import { CommonActions } from "@react-navigation/native";
const SettingGroupChatScreen = ({ route }) => {
  const navigation = useNavigation();
  const { room } = route.params;
  const [showMembers, setShowMembers] = useState(false);
  // const [users, setUsers] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showAvailableUsers, setShowAvailableUsers] = useState(false);
  const currentUser = useSelector((state) => state.user.user);
  const [isOwner, setIsOwner] = useState(true); // Biến trạng thái để kiểm soát việc hiển thị các nút
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleAvailableUsers = () => {
    setShowAvailableUsers(!showAvailableUsers);
  };

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        // Lấy danh sách người dùng chưa tham gia cuộc trò chuyện
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

  // Ham Xoa nguoi dung khoi groupchat
  const removeParticipant = async (userId) => {
    try {
      // Kiểm tra xem người dùng hiện tại có phải là owner của group chat hay không

      if (room.owner._id !== currentUser._id) {
        throw new Error("Only the owner can remove participants.");
      }
      //   console.log("Owner: ", room.owner);
      const userRef = doc(firestoreDB, "users", userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      // Sử dụng array.filter để loại bỏ người dùng khỏi danh sách tham gia cuộc trò chuyện
      const updatedParticipants = room.participants.filter(
        (participant) => participant._id !== userId
      );

      // Cập nhật dữ liệu của cuộc trò chuyện với danh sách người dùng mới
      await updateDoc(doc(firestoreDB, "groupChats", room._id), {
        participants: updatedParticipants,
      });

      // Cập nhật lại state của cuộc trò chuyện
      route.params.room.participants = updatedParticipants;

      // console.log("User removed successfully");
      Alert.alert("Success", "User removed successfully");
    } catch (error) {
      // console.error("Error removing user:", error);
      // console.error(
      //   `Owner ID: ${room.owner._id}, Current User ID: ${currentUser._id}`
      // );

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

  // Ham them nguoi dung vao groupchat
  const addParticipantToChat = async (userId) => {
    try {
      // Kiểm tra xem người dùng hiện tại có phải là owner của group chat hay không

      if (room.owner._id !== currentUser._id) {
        throw new Error("Only the owner can remove participants.");
      }
      const userRef = doc(firestoreDB, "users", userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      // Thêm người dùng vào danh sách tham gia cuộc trò chuyện
      const updatedParticipants = [...room.participants, userData];

      // Cập nhật dữ liệu của cuộc trò chuyện với danh sách người dùng mới
      await updateDoc(doc(firestoreDB, "groupChats", room._id), {
        participants: updatedParticipants,
      });

      // Cập nhật lại state của cuộc trò chuyện
      route.params.room.participants = updatedParticipants;

      // Cập nhật lại danh sách người dùng chưa tham gia
      const updatedAvailableUsers = availableUsers.filter(
        (user) => user._id !== userId
      );
      setAvailableUsers(updatedAvailableUsers);

      Alert.alert("Success", "User added to chat successfully");
    } catch (error) {
      // console.error("Error adding user to chat:", error);
      Alert.alert(
        "Error",
        "You aren't owner group chat. Please try again later."
      );
    }
  };

  // Ham chuyen quyen chu phong
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
      setIsOwner(false); // Sau khi chuyển quyền, đặt biến trạng thái là false
      Alert.alert("Success", "Ownership transferred successfully");
    } catch (error) {
      console.error("Error transferring ownership:", error);
      Alert.alert(
        "Error",
        "Failed to transfer ownership. Please try again later."
      );
    }
  };
  const updateUI = () => {
    // Loại bỏ quyền sở hữu trong giao diện
    // Ví dụ: ẩn các nút hoặc chức năng chỉ dành cho chủ sở hữu
    setCanAccessFunctions(false);
  };

  // Ham xac nhan chuyen quyen chu phong
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

  // Render item Members List Not Join
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
      {isOwner &&
        room.owner._id === currentUser._id &&
        currentUser._id !== item._id && (
          // Nút hiển thị nếu người dùng hiện tại là Owner chứ không phải người dùng hiện tại trong danh sách
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
        // Hiển thị "Owner" nếu người dùng hiện tại là Owner và là người dùng hiện tại trong danh sách
        <View style={{ flexDirection: "row" }}>
          <Text>Owner</Text>
        </View>
      )}
      {room.owner._id !== currentUser._id && room.owner._id === item._id && (
        // Hiển thị "Owner" nếu người dùng hiện tại không phải là Owner
        <View style={{ flexDirection: "row" }}>
          <Text>Owner</Text>
        </View>
      )}
    </View>
  );

  // Ham giai tan nhom
  const dissolveGroupChat = async () => {
    try {
      // Kiểm tra xem người dùng hiện tại có phải là chủ sở hữu của nhóm không
      if (room.owner._id !== currentUser._id) {
        throw new Error("Only the owner can dissolve the group chat.");
      }

      // Xóa tất cả các thành viên khỏi cuộc trò chuyện
      await updateDoc(doc(firestoreDB, "groupChats", room._id), {
        participants: [],
      });

      // Xóa cuộc trò chuyện khỏi cơ sở dữ liệu
      await deleteDoc(doc(firestoreDB, "groupChats", room._id));

      // Hiển thị thông báo thành công
      Alert.alert("Success", "Group chat dissolved successfully");
      // Chuyển về màn hình HomeScreen và reset lại navigation stack
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "HomeScreen" }],
        })
      );
    } catch (error) {
      // console.error("Error dissolving group chat:", error);
      Alert.alert(
        "Error",
        "You aren't owner of group chat. Please try again later."
      );
    }
  };
  const deleteChat = async () => {
    try {
      // Kiểm tra xem người dùng hiện tại có quyền xóa cuộc trò chuyện không
      if (room.owner._id !== currentUser._id) {
        throw new Error("Only the owner can delete the chat.");
      }

      // Xóa cuộc trò chuyện khỏi cơ sở dữ liệu
      await deleteDoc(doc(firestoreDB, "chats", room._id));

      // Hiển thị thông báo thành công
      Alert.alert("Success", "Chat deleted successfully");
    } catch (error) {
      console.error("Error deleting chat:", error);
      Alert.alert("Error", "Failed to delete chat. Please try again later.");
    }
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
      <View
        style={{
          // borderBottomColor: "black",
          // borderBottomWidth: 1,

          width: "100%",
        }}
      >
        <View>
          <TouchableOpacity
            onPress={toggleAvailableUsers}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 12,
              paddingVertical: 16,
              borderBottomColor: "black",
              borderBottomWidth: 1,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              Members Not Join
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={32} color="#555" />
          </TouchableOpacity>
        </View>

        {showAvailableUsers && (
          <>
            {/* Danh sách người dùng chưa tham gia */}
            <FlatList
              data={availableUsers}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 16,
                    marginBottom: 10,
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
                  {room.owner._id === currentUser._id &&
                    currentUser._id !== item._id && (
                      <TouchableOpacity
                        onPress={() => addParticipantToChat(item._id)}
                      >
                        <FontAwesome name="plus" size={24} color="#333" />
                      </TouchableOpacity>
                    )}
                </View>
              )}
            />
          </>
        )}
      </View>

      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomColor: "black",
          borderBottomWidth: 1,
        }}
      >
        <TouchableOpacity onPress={toggleMembers}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            Members Joined
          </Text>
        </TouchableOpacity>
        <MaterialIcons name="keyboard-arrow-down" size={32} color="#555" />
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
        {isOwner && (
          <TouchableOpacity onPress={dissolveGroupChat}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "red",
              }}
            >
              Dissolve The Group Chat
            </Text>
          </TouchableOpacity>
        )}
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

export default SettingGroupChatScreen;
