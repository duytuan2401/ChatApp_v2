import {
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  FlatList,
} from "react-native";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Logo } from "../assets";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { firebaseAuth, firestoreDB } from "../config/firebase.config";
import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
  doc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function HomeScreen() {
  const user = useSelector((state) => state.user.user);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [personalChats, setPersonalChats] = useState(null);
  const [groupChats, setGroupChats] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [showPersonalChats, setShowPersonalChats] = useState(false);
  const [showGroupChats, setShowGroupChats] = useState(false);

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
  };

  const fetchChats = async () => {
    try {
      setIsLoading(true);

      // Truy vấn và lấy dữ liệu từ collection "chats" mà người dùng hiện tại tham gia
      const chatQuerySnapshot = await getDocs(
        query(
          collection(firestoreDB, "chats"),
          where("participants", "array-contains", user)
        )
      );
      const chatData = chatQuerySnapshot.docs.map((doc) => doc.data());
      setPersonalChats(chatData);

      // Truy vấn và lấy dữ liệu từ collection "groupchats" mà người dùng hiện tại tham gia
      const groupChatQuerySnapshot = await getDocs(
        query(
          collection(firestoreDB, "groupChats"),
          where("participants", "array-contains", user)
        )
      );

      const groupChatData = groupChatQuerySnapshot.docs.map((doc) =>
        doc.data()
      );
      setGroupChats(groupChatData);
    } catch (error) {
      console.error("Error fetching chats:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all users for search suggestions
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuerySnapshot = await getDocs(
          collection(firestoreDB, "users")
        );
        const usersData = usersQuerySnapshot.docs.map((doc) => doc.data());
        setAllUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error.message);
      }
    };

    fetchUsers();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [user])
  );

  useEffect(() => {
    let timer;
    if (showOptions) {
      timer = setTimeout(() => {
        setShowOptions(false);
      }, 5000); // Hide options after 5 seconds
    }
    return () => clearTimeout(timer);
  }, [showOptions]);

  const togglePersonalChats = () => {
    setShowPersonalChats(!showPersonalChats);
  };

  const toggleGroupChats = () => {
    setShowGroupChats(!showGroupChats);
  };

  const handleProfilePicPress = () => {
    setShowOptions(!showOptions);
  };

  const handleSignOut = async () => {
    try {
      navigation.navigate("LoginScreen");
      setLoading(true);
      await signOut(firebaseAuth);
    } catch (error) {
      console.error("Error signing out:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToProfile = () => {
    navigation.navigate("ProfileScreen", { userProfileData: user });
  };

  const createChat = async (selectedUser) => {
    try {
      // Kiểm tra xem đã tồn tại cuộc trò chuyện với người dùng này chưa
      const existingChat = personalChats.find((chat) => {
        const participantsIds = chat.participants.map(
          (participant) => participant._id
        );
        return participantsIds.includes(selectedUser._id);
      });

      if (existingChat) {
        // Nếu đã tồn tại, chuyển sang màn hình chat
        navigation.navigate("ChatScreen", { room: existingChat });
      } else {
        // Nếu chưa tồn tại, tiến hành tạo cuộc trò chuyện mới
        const id = `${Date.now()}`;
        const chatData = {
          _id: id,
          owner: user,
          isGroup: false,
          participants: [user, selectedUser],
          chatName: `${user.fullName} & ${selectedUser.fullName}`,
        };

        await setDoc(doc(firestoreDB, "chats", id), chatData);
        navigation.navigate("ChatScreen", { room: chatData });
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      alert("An error occurred while creating the chat.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F0F0F0", paddingTop: 30 }}>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 20,
          paddingHorizontal: 20,
          backgroundColor: "#8A2BE2",
          zIndex: 1,
        }}
      >
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
            source={Logo}
            style={{ width: 48, height: 48 }}
            resizeMode="contain"
          />
        </View>

        <Text style={{ fontSize: 28, color: "#333" }}>AppChat</Text>
        <TouchableOpacity
          style={{
            width: 48,
            height: 48,
            borderColor: "white",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 50,
          }}
          onPress={handleProfilePicPress}
        >
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
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>
          {showOptions && (
            <ScrollView
              ref={scrollViewRef}
              style={{
                position: "absolute",
                top: 50,
                borderRadius: 4,
                paddingVertical: 4,
                paddingHorizontal: 8,
                width: 80,
                borderWidth: 1,
                zIndex: 1000,
              }}
            >
              <View style={{ width: "100%" }}>
                <TouchableOpacity onPress={handleNavigateToProfile}>
                  <Text
                    style={{
                      marginBottom: 8,
                      fontSize: 16,
                      color: "red",
                    }}
                  >
                    Profile
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSignOut} disabled={loading}>
                  <Text
                    style={{
                      marginBottom: 8,
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "red",
                    }}
                  >
                    Sign out
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          paddingVertical: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("AddToChatScreen")}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="chatbox" size={32} color="#555" />
        </TouchableOpacity>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {allUsers
            // Kiểm tra nếu user không phải là user hiện tại thì mới render ảnh
            .filter((u) => u._id !== user._id)
            .map((user, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => createChat(user)}
                style={{ alignItems: "center", marginRight: 10 }}
              >
                <Image
                  source={{ uri: user.profilePic }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "#ddd",
                  }}
                />
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginRight: 20,
          marginLeft: 20,
        }}
      >
        <TextInput
          placeholder="Search"
          style={{
            flex: 1,
            height: 40,
            borderColor: "black",
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 10,
            marginRight: 15,
          }}
          value={searchKeyword}
          onChangeText={handleSearch}
        />
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          width: "100%",
          paddingHorizontal: 16,
          paddingTop: 16,
          flex: 1,
        }}
      >
        <View style={{ width: "100%" }}>
          {isLoading ? (
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator size="large" color="#43C651" />
            </View>
          ) : (
            <>
              {personalChats && personalChats.length > 0 && (
                <TouchableOpacity onPress={togglePersonalChats}>
                  <Text
                    style={{
                      color: "black",
                      fontSize: 20,
                      fontWeight: "bold",
                      marginBottom: 15,
                    }}
                  >
                    Personal Chats
                  </Text>
                  {showPersonalChats &&
                    personalChats
                      .filter((room) =>
                        room.chatName
                          .toLowerCase()
                          .includes(searchKeyword.toLowerCase())
                      )
                      .map((room) => (
                        <MessageCard key={room._id} room={room} />
                      ))}
                </TouchableOpacity>
              )}
              {groupChats && groupChats.length > 0 && (
                <View>
                  <TouchableOpacity onPress={toggleGroupChats}>
                    <Text
                      style={{
                        color: "black",
                        fontSize: 20,
                        fontWeight: "bold",
                        marginBottom: 15,
                      }}
                    >
                      Group Chats
                    </Text>
                    {showGroupChats &&
                      groupChats
                        .filter((room) =>
                          room.chatName
                            .toLowerCase()
                            .includes(searchKeyword.toLowerCase())
                        )
                        .map((room) => (
                          <MessageCard key={room._id} room={room} />
                        ))}
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const MessageCard = ({ room }) => {
  const navigation = useNavigation();
  const maxAvatars = 4; // so luong avatar toi da trong vong tron

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("ChatScreen", { room: room })}
      style={{
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingVertical: 5,
      }}
    >
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          borderWidth: 1,
          borderColor: "#ddd",
          overflow: "hidden",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        {room.participants.slice(0, maxAvatars).map((participant, index) => (
          <Image
            key={index}
            source={{ uri: participant.profilePic }}
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              position: "absolute",
              top: Math.cos((2 * Math.PI * index) / maxAvatars) * 12 + 12,
              left: Math.sin((2 * Math.PI * index) / maxAvatars) * 12 + 12,
            }}
          />
        ))}
        {room.participants.length > maxAvatars && (
          <View
            style={{
              position: "absolute",
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: "gray",
              justifyContent: "center",
              alignItems: "center",
              top: 0,
              right: 0,
            }}
          >
            <Text style={{ color: "white", fontSize: 12 }}>
              +{room.participants.length - maxAvatars}
            </Text>
          </View>
        )}
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          marginLeft: 16,
        }}
      >
        <Text
          style={{
            color: "#333",
            fontSize: 16,
            fontWeight: "bold",
            textTransform: "capitalize",
          }}
        >
          {room.chatName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
