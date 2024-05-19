import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from "react-native";
import React, { useLayoutEffect, useState } from "react";
import { Entypo, MaterialIcons } from "@expo/vector-icons";

export default function UserTextInput({
  placeholder,
  isPass,
  setStatValue,
  setGetEmailValidationStatus,
}) {
  const [value, setValue] = useState("");
  const [showPass, setShowPass] = useState(true);
  const [icon, setIcon] = useState(null);
  const [isEmailValid, setIsEmailValid] = useState(false);

  const handleTextChanged = (text) => {
    setValue(text);
    setStatValue(text);

    if (placeholder === "Email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const status = emailRegex.test(value);
      setIsEmailValid(status);
      setGetEmailValidationStatus(status);
    }
  };

  useLayoutEffect(() => {
    switch (placeholder) {
      case "Username":
        return setIcon("person");
      case "Email":
        return setIcon("email");
      case "Password":
        return setIcon("lock");
    }
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderRadius: 8,
        width: "100%",
        borderColor:
          !isEmailValid && placeholder === "Email" && value.length > 0
            ? "red"
            : "#ccc",
      }}
    >
      <MaterialIcons name={icon} size={24} color={"#6c6d83"} />
      <TextInput
        style={styles.input} // Remove flex: 1 here
        placeholder={placeholder}
        value={value}
        onChangeText={handleTextChanged}
        secureTextEntry={isPass && showPass}
        // onFocus={() => Keyboard.dismiss()}
      />
      <View>
        {isPass && (
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Entypo
              name={`${showPass ? "eye" : "eye-with-line"}`}
              size={24}
              color={"#6c6d83"}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    marginLeft: 12,
    fontSize: 16,
    color: "#000",
    width: "100%", // Set width to 100%
  },
});
