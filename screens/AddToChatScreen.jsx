import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  // CheckBox,
} from "react-native";
import React, { useState, useEffect } from "react";
import { MaterialIcons, FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { doc, setDoc, getDocs, collection, addDoc } from "firebase/firestore";
import { firestoreDB } from "../config/firebase.config";
import CheckBox from "react-native-checkbox";
import { CommonActions } from "@react-navigation/native";

const AddToChatScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state) => state.user.user);
  const [addChat, setAddChat] = useState("");
  const [users, setUsers] = useState([]);
  const [isCreatingGroupChat, setIsCreatingGroupChat] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState([]); // State để lưu danh sách các người dùng được chọn

  // Hàm để thêm hoặc loại bỏ một người dùng khỏi danh sách đã chọn
  const toggleUserSelection = (userToToggle) => {
    // Kiểm tra xem người dùng đã được chọn hay chưa
    const isSelected = selectedUsers.some(
      (user) => user._id === userToToggle._id
    );

    // Nếu người dùng đã được chọn, loại bỏ khỏi danh sách
    if (isSelected) {
      setSelectedUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== userToToggle._id)
      );
    } else {
      // Nếu người dùng chưa được chọn, thêm vào danh sách
      setSelectedUsers((prevUsers) => [...prevUsers, userToToggle]);
    }
  };

  const createChat = async () => {
    if (!addChat.trim()) {
      alert("Please enter a name for the chat.");
      return;
    }

    try {
      if (isCreatingGroupChat) {
        // Tạo group chat
        if (selectedUsers.length < 2) {
          alert("Please select at least two users to create a group chat.");
          return;
        }

        const id = `${Date.now()}`;
        const groupChatData = {
          _id: id,
          isGroup: true,
          owner: user,
          participants: [...selectedUsers, user], // Thêm người dùng hiện tại vào danh sách thành viên
          chatName: addChat,
        };

        await setDoc(doc(firestoreDB, "groupChats", id), groupChatData);

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "HomeScreen", params: { groupId: id } }],
          })
        );
      } else {
        // Tạo chat đơn (private chat)
        if (selectedUsers.length !== 1) {
          alert("Please select one user to create a private chat.");
          return;
        }

        const selectedUser = selectedUsers[0];
        const id2 = `${Date.now()}`;
        const chatData = {
          _id: id2,
          owner: user,
          isGroup: false,
          participants: [user, selectedUser], // Thêm người dùng hiện tại và người dùng được chọn
          chatName: addChat,
        };

        await setDoc(doc(firestoreDB, "chats", id2), chatData);
        setAddChat("");
        navigation.replace("HomeScreen");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      alert("An error occurred while creating the chat.");
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestoreDB, "users"));
        const fetchedUsers = [];
        querySnapshot.forEach((doc) => {
          fetchedUsers.push(doc.data());
        });
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, []);

  const renderItem = ({ item }) => {
    if (item._id !== user._id) {
      return (
        <TouchableOpacity onPress={() => toggleUserSelection(item)}>
          <View
            style={{ flexDirection: "row", alignItems: "center", padding: 16 }}
          >
            <Image
              source={{ uri: item.profilePic }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                marginRight: 16,
              }}
              resizeMode="cover"
            />
            <Text style={{ fontSize: 18 }}>{item.fullName}</Text>
            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                marginLeft: "auto",
              }}
            >
              <CheckBox
                label=""
                checked={selectedUsers.some((user) => user._id === item._id)}
                onChange={() => toggleUserSelection(item)}
              />
            </View>
          </View>
        </TouchableOpacity>
      );
    }
    return null; // Nếu trùng, không hiển thị item
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          backgroundColor: "#8A2BE2",
          paddingTop: 50,
          paddingHorizontal: 20,
          paddingVertical: 25,
          width: "100%",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            // paddingHorizontal: 20,
          }}
        >
          {/* Go back */}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="chevron-left" size={32} color="#333" />
          </TouchableOpacity>
          {/* Middle */}
          <Text style={{ fontSize: 20, color: "#333" }}>Create Chat</Text>
          {/* last section */}
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              borderWidth: 1,
              borderColor: "#ddd",
              overflow: "hidden",
            }}
          >
            <Image
              source={{ uri: user?.profilePic }}
              style={{ width: 48, height: 48 }}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
      {/* bottom section */}
      <View
        style={{
          width: "100%",
          backgroundColor: "white",
          paddingVertical: 16,
          paddingHorizontal: 16,
          flex: 1,
          marginTop: -10,
        }}
      >
        <View style={{ width: "100%", padding: 16 }}>
          <View
            style={{
              width: "100%",
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 20,
              borderColor: "#E5E7EB",
            }}
          >
            {/* text input */}
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                color: "#333",
                marginTop: -8,
                marginRight: 20,
                height: 40,
                width: "100%",
                paddingLeft: 8,
                paddingRight: 8,
                borderColor: "#999",
                borderWidth: 1,
                borderRadius: 8,
              }}
              placeholder="Enter a name for chat"
              placeholderTextColor="#999"
              value={addChat}
              onChangeText={(text) => setAddChat(text)}
            />

            {/* icons group chat */}
            <TouchableOpacity
              onPress={() => setIsCreatingGroupChat((prevState) => !prevState)}
            >
              <MaterialIcons
                name={isCreatingGroupChat ? "people" : "nature-people"}
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* FlatList to display users */}
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          style={{ flex: 1 }}
        />
      </View>
      <View
        style={{
          height: 48,
          width: "50%",
          backgroundColor: "#8A2BE2",
          borderWidth: 1,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "center",
        }}
      >
        <TouchableOpacity
          onPress={createChat}
          // disabled={!isCreatingGroupChat && selectedUsers.length !== 1}
        >
          <Text style={{ fontSize: 20 }}>
            Create {isCreatingGroupChat ? "Group Chat" : "Chat"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddToChatScreen;
