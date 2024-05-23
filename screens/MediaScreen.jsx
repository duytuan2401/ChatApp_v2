import React, { useEffect, useState, useLayoutEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { firestoreDB } from "../config/firebase.config";
import { useSelector } from "react-redux";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Audio, Video } from "expo-av";

const MediaScreen = ({ route }) => {
  const [messages, setMessages] = useState([]);
  const user = useSelector((state) => state.user.user);
  const { room } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  useLayoutEffect(() => {
    const msgQuery = query(
      collection(firestoreDB, "chats", room?._id, "messages"),
      orderBy("timeStamp", "asc")
    );
    const unsubscribe = onSnapshot(msgQuery, (querySnap) => {
      const upMsg = querySnap.docs.map((doc) => doc.data());
      setMessages(upMsg);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

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
          <Text style={{ fontSize: 20, color: "#333" }}>
            Media & Downloaded
          </Text>
        </View>
      </View>
      <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}>
        {messages.map((item) => (
          <View key={item._id} style={{ width: "25%", padding: 5 }}>
            {item.message.includes(".mp4") ? (
              <Video
                source={{ uri: item.message }}
                style={{ width: "100%", aspectRatio: 1 }}
                resizeMode="cover"
                useNativeControls
              />
            ) : (
              <Image
                source={{ uri: item.message }}
                style={{ width: "100%", aspectRatio: 1 }}
                resizeMode="cover"
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default MediaScreen;
