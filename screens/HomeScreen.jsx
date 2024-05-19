// import {
//   View,
//   Text,
//   Image,
//   SafeAreaView,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   TextInput,
// } from "react-native";
// import React, { useState, useRef, useEffect } from "react";
// import { Logo } from "../assets";
// import { useSelector } from "react-redux";
// import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import { firebaseAuth, firestoreDB } from "../config/firebase.config";
// import {
//   collection,
//   collectionGroup,
//   onSnapshot,
//   orderBy,
//   query,
//   where,
//   getDocs,
// } from "firebase/firestore";
// import { signOut } from "firebase/auth";

// export default function HomeScreen() {
//   const user = useSelector((state) => state.user.user);
//   const [isLoading, setIsLoading] = useState(false);
//   const navigation = useNavigation();
//   const scrollViewRef = useRef(null);
//   const [showOptions, setShowOptions] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [chats, setChats] = useState(null);

//   const [personalChats, setPersonalChats] = useState(null);
//   const [groupChats, setGroupChats] = useState(null);
//   // Bước 1: Tạo State và Hàm Xử Lý Tìm Kiếm
//   const [searchKeyword, setSearchKeyword] = useState(""); // State lưu trữ từ khóa tìm kiếm
//   const handleSearch = (keyword) => {
//     setSearchKeyword(keyword); // Cập nhật giá trị của từ khóa tìm kiếm
//   };

//   useEffect(() => {
//     const fetchChats = async () => {
//       try {
//         setIsLoading(true);

//         // Truy vấn và lấy dữ liệu từ collection "chats" mà người dùng hiện tại tham gia
//         const chatQuerySnapshot = await getDocs(
//           query(
//             collection(firestoreDB, "chats"),
//             where("participants", "array-contains", user)
//           )
//         );
//         console.log("user_id", user);
//         const chatData = chatQuerySnapshot.docs.map((doc) => doc.data());
//         console.log("Personal Chats:", chatData);
//         setPersonalChats(chatData);

//         // Truy vấn và lấy dữ liệu từ collection "groupchats" mà người dùng hiện tại tham gia
//         const groupChatQuerySnapshot = await getDocs(
//           query(
//             collection(firestoreDB, "groupChats"),
//             where("participants", "array-contains", user)
//           )
//         );

//         const groupChatData = groupChatQuerySnapshot.docs.map((doc) =>
//           doc.data()
//         );
//         console.log("groupChatData:", groupChatData);
//         setGroupChats(groupChatData);
//       } catch (error) {
//         console.error("Error fetching chats:", error.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchChats();
//   }, [user]);

//   const handleProfilePicPress = () => {
//     setShowOptions(!showOptions);
//   };

//   const handleSignOut = async () => {
//     try {
//       navigation.navigate("LoginScreen");
//       setLoading(true);
//       await signOut(firebaseAuth); // Thực hiện đăng xuất từ Firebase Authentication
//     } catch (error) {
//       console.error("Error signing out:", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleNavigateToProfile = () => {
//     navigation.navigate("ProfileScreen");
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: "#F0F0F0", paddingTop: 30 }}>
//       <SafeAreaView>
//         <View
//           style={{
//             width: "100%",
//             flexDirection: "row",
//             alignItems: "center",
//             justifyContent: "space-between",
//             paddingVertical: 20,
//             paddingHorizontal: 20,
//             backgroundColor: "#8A2BE2",
//           }}
//         >
//           <Image
//             source={Logo}
//             style={{ width: 48, height: 48 }}
//             resizeMode="contain"
//           />
//           <Text style={{ fontSize: 28, color: "#333" }}>AppChat</Text>
//           <TouchableOpacity
//             style={{
//               width: 48,
//               height: 48,
//               // borderRadius: 8,
//               // borderWidth: 2,
//               borderColor: "white",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//             onPress={handleProfilePicPress}
//           >
//             <Image
//               source={{ uri: user?.profilePic }}
//               style={{ width: "100%", height: "100%" }}
//               resizeMode="cover"
//             />
//             {showOptions && (
//               <ScrollView
//                 ref={scrollViewRef}
//                 style={{
//                   position: "absolute",
//                   top: 45,
//                   // right: 5,
//                   backgroundColor: "white",
//                   borderRadius: 4,
//                   paddingVertical: 4,
//                   paddingHorizontal: 8,
//                   width: 80,
//                   borderWidth: 1,
//                 }}
//               >
//                 <View style={{ width: "100%" }}>
//                   <TouchableOpacity onPress={handleSignOut} disabled={loading}>
//                     <Text
//                       style={{ marginBottom: 8, fontSize: 15, color: "red" }}
//                     >
//                       Sign out
//                     </Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity onPress={handleNavigateToProfile}>
//                     <Text
//                       style={{
//                         marginBottom: 8,
//                         fontSize: 15,
//                         color: "red",
//                       }}
//                     >
//                       Profile
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               </ScrollView>
//             )}
//           </TouchableOpacity>
//         </View>
//         <View
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             marginRight: 20,
//             marginLeft: 20,
//             marginTop: 20,
//           }}
//         >
//           <TextInput
//             placeholder="Search"
//             style={{
//               flex: 1,
//               height: 40,
//               borderColor: "black",
//               borderWidth: 1,
//               borderRadius: 8,
//               paddingHorizontal: 10,
//               marginRight: 15,
//             }}
//             value={searchKeyword}
//             onChangeText={handleSearch}
//           />
//           <TouchableOpacity>
//             <Ionicons name="search" size={24} color="black" />
//           </TouchableOpacity>
//         </View>

//         {/* Scrolling view */}
//         <ScrollView
//           style={{ width: "100%", paddingHorizontal: 16, paddingTop: 16 }}
//         >
//           <View style={{ width: "100%" }}>
//             <View
//               style={{
//                 width: "100%",
//                 flexDirection: "row",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 // paddingHorizontal: 3,
//               }}
//             >
//               <Text
//                 style={{
//                   color: "black",
//                   fontSize: 20,
//                   fontWeight: "bold",
//                   paddingBottom: 2,
//                 }}
//               >
//                 Create message
//               </Text>
//               <TouchableOpacity
//                 onPress={() => navigation.navigate("AddToChatScreen")}
//               >
//                 <Ionicons name="chatbox" size={28} color="#555" />
//               </TouchableOpacity>
//             </View>
//             {isLoading ? (
//               <View
//                 style={{
//                   width: "100%",
//                   flexDirection: "row",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <ActivityIndicator size="large" color="#43C651" />
//               </View>
//             ) : (
//               <>
//                 {/* Personal Chats */}
//                 {personalChats && personalChats.length > 0 && (
//                   <View>
//                     <Text
//                       style={{
//                         color: "black",
//                         fontSize: 20,
//                         fontWeight: "bold",
//                         marginBottom: 15,
//                       }}
//                     >
//                       Personal Chats
//                     </Text>
//                     {personalChats
//                       .filter((room) =>
//                         room.chatName
//                           .toLowerCase()
//                           .includes(searchKeyword.toLowerCase())
//                       ) // Lọc danh sách cuộc trò chuyện dựa vào từ khóa tìm kiếm
//                       .map((room) => (
//                         <MessageCard key={room._id} room={room} />
//                       ))}
//                   </View>
//                 )}
//                 {/* Group Chats */}
//                 {groupChats && groupChats.length > 0 && (
//                   <View>
//                     <Text
//                       style={{
//                         color: "black",
//                         fontSize: 20,
//                         fontWeight: "bold",
//                         marginBottom: 15,
//                       }}
//                     >
//                       Group Chats
//                     </Text>
//                     {groupChats
//                       .filter((room) =>
//                         room.chatName
//                           .toLowerCase()
//                           .includes(searchKeyword.toLowerCase())
//                       )
//                       .map((room) => (
//                         <MessageCard key={room._id} room={room} />
//                       ))}
//                   </View>
//                 )}
//               </>
//             )}
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </View>
//   );
// }

// const MessageCard = ({ room }) => {
//   const navigation = useNavigation();
//   return (
//     <TouchableOpacity
//       onPress={() => navigation.navigate("ChatScreen", { room: room })}
//       style={{
//         width: "100%",
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "flex-start",
//       }}
//     >
//       {/* images */}
//       <View
//         style={{
//           width: 40,
//           height: 40,
//           borderRadius: 20,
//           alignItems: "center",
//           justifyContent: "center",
//           borderWidth: 2,
//           borderColor: "black",
//           padding: 1,
//           marginBottom: 10,
//         }}
//       >
//         <FontAwesome5 name="users" size={24} color="black" />
//       </View>
//       {/* content */}
//       <View
//         style={{
//           flex: 1,
//           flexDirection: "column",
//           alignItems: "flex-start",
//           justifyContent: "center",
//           marginLeft: 16,
//         }}
//       >
//         <Text
//           style={{
//             color: "#333",
//             fontSize: 16,
//             fontWeight: "bold",
//             textTransform: "capitalize",
//           }}
//         >
//           {room.chatName}
//         </Text>
//       </View>
//       {/* time text */}
//       {/* <Text
//         style={{
//           color: "black",
//           paddingHorizontal: 16,
//           fontSize: 16,
//           fontWeight: "bold",
//         }}
//       >
//         27 min
//       </Text> */}
//     </TouchableOpacity>
//   );
// };
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
import React, { useState, useRef, useEffect } from "react";
import { Logo } from "../assets";
import { useSelector } from "react-redux";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { firebaseAuth, firestoreDB } from "../config/firebase.config";
import {
  collection,
  getDoc,
  getDocs,
  query,
  where,
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

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
  };

  useEffect(() => {
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
        console.log("user_id", user);
        const chatData = chatQuerySnapshot.docs.map((doc) => doc.data());
        console.log("Personal Chats:", chatData);
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
        console.log("groupChatData:", groupChatData);
        setGroupChats(groupChatData);
      } catch (error) {
        console.error("Error fetching chats:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [user]);

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

  return (
    <View style={{ flex: 1, backgroundColor: "#F0F0F0", paddingTop: 30 }}>
      <SafeAreaView>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 20,
            paddingHorizontal: 20,
            backgroundColor: "#8A2BE2",
            zIndex: 1, // Ensure the header has a higher zIndex
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
              // justifyContent: "center",
              // alignItems: "center",
              // position: "relative",
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
                // justifyContent: "center",
                // alignItems: "center",
                // position: "relative",
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
                  // backgroundColor: "#F0F0F0",
                  borderRadius: 4,
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  width: 80,
                  borderWidth: 1,
                  zIndex: 1000, // Ensure this is on top
                }}
              >
                <View style={{ width: "100%" }}>
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
                </View>
              </ScrollView>
            )}
          </TouchableOpacity>
        </View>
        <View
          style={{ flexDirection: "row", marginTop: 20, paddingHorizontal: 20 }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("AddToChatScreen")}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 1,
              // borderColor: "#ddd",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chatbox" size={32} color="#555" />
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {allUsers.map((user, index) => (
              <View
                key={index}
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
                <Text style={{ fontSize: 12, marginTop: 5 }}>{user.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 20,
            marginLeft: 20,
            // marginTop: 20,
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

        {/* Display search suggestions
        {searchKeyword.length > 0 && (
          <FlatList
            data={allUsers.filter((user) =>
              user.name.toLowerCase().includes(searchKeyword.toLowerCase())
            )}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 10,
                }}
                onPress={() => {
                  setSearchKeyword(item.name);
                  // Handle user selection, e.g., navigate to user's profile or chat
                }}
              >
                <Image
                  source={{ uri: item.profilePic }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 10,
                  }}
                />
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
            style={{
              position: "absolute",
              top: 100,
              left: 20,
              right: 20,
              backgroundColor: "white",
              borderRadius: 8,
              borderColor: "black",
              borderWidth: 1,
              zIndex: 1,
            }}
          />
        )} */}

        <ScrollView
          style={{ width: "100%", paddingHorizontal: 16, paddingTop: 16 }}
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
                  <View>
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
                    {personalChats
                      .filter((room) =>
                        room.chatName
                          .toLowerCase()
                          .includes(searchKeyword.toLowerCase())
                      )
                      .map((room) => (
                        <MessageCard key={room._id} room={room} />
                      ))}
                  </View>
                )}
                {groupChats && groupChats.length > 0 && (
                  <View>
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
                    {groupChats
                      .filter((room) =>
                        room.chatName
                          .toLowerCase()
                          .includes(searchKeyword.toLowerCase())
                      )
                      .map((room) => (
                        <MessageCard key={room._id} room={room} />
                      ))}
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
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
              width: 24, // Size of each avatar
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
