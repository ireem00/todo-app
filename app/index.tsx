import {
  FlatList,
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ToDoType = {
  id: number;
  title: string | undefined;
  isDone: boolean;
};

export default function Index() {
  const [todos, setTodos] = useState<ToDoType[]>([]);
  const [todoText, setTodoText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [oldTodos, setOldTodos] = useState<ToDoType[]>([]);

  useEffect(() => {
    const getTodos = async () => {
      try {
        const todos = await AsyncStorage.getItem("my-todo");
        if (todos !== null) {
          const parsed = JSON.parse(todos);
          setTodos(parsed);
          setOldTodos(parsed);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getTodos();
  }, []);

  const addTodo = async () => {
    try {
      if (!todoText.trim()) return;

      const newTodo: ToDoType = {
        id: Math.random(),
        title: todoText,
        isDone: false,
      };

      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      setOldTodos(updatedTodos);
      await AsyncStorage.setItem("my-todo", JSON.stringify(updatedTodos));
      setTodoText("");
      Keyboard.dismiss();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const newTodos = todos.filter((todo) => todo.id !== id);
      setTodos(newTodos);
      setOldTodos(newTodos);
      await AsyncStorage.setItem("my-todo", JSON.stringify(newTodos));
    } catch (error) {
      console.log(error);
    }
  };

  const handleDone = async (id: number) => {
    try {
      const newTodos = todos.map((todo) =>
        todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
      );
      setTodos(newTodos);
      setOldTodos(newTodos);
      await AsyncStorage.setItem("my-todo", JSON.stringify(newTodos));
    } catch (error) {
      console.log(error);
    }
  };

  const onSearch = (query: string) => {
    if (query.trim() === "") {
      setTodos(oldTodos);
    } else {
      const filteredTodos = oldTodos.filter((todo) =>
        todo.title?.toLowerCase().includes(query.toLowerCase())
      );
      setTodos(filteredTodos);
    }
  };

  useEffect(() => {
    onSearch(searchQuery);
  }, [searchQuery]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => alert("Clicked!")}>
            <Ionicons name="menu" size={24} color={"#056"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Image
              source={{
                uri: "https://w7.pngwing.com/pngs/323/429/png-transparent-computer-icons-female-user-profile-avatar-material-child-heroes-hand.png",
              }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={24} color={"#333"} />
          <TextInput
            placeholder="Search"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={[...todos].reverse()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ToDoItem
              todo={item}
              deleteTodo={deleteTodo}
              handleTodo={handleDone}
            />
          )}
          keyboardShouldPersistTaps="handled"
        />

        <View style={styles.footer}>
          <TextInput
            placeholder="Add New ToDo"
            value={todoText}
            onChangeText={(text) => setTodoText(text)}
            style={styles.newTodoInput}
            autoCorrect={false}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addButton} onPress={addTodo}>
            <Ionicons name="add" size={34} color={"#fff"} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const ToDoItem = ({
  todo,
  deleteTodo,
  handleTodo,
}: {
  todo: ToDoType;
  deleteTodo: (id: number) => void;
  handleTodo: (id: number) => void;
}) => (
  <View style={styles.todoContainer}>
    <View style={styles.todoInfoContainer}>
      <Checkbox
        value={todo.isDone}
        onValueChange={() => handleTodo(todo.id)}
        color={todo.isDone ? "#6BCB77" : undefined}
      />
      <Text
        style={[
          styles.todoText,
          todo.isDone && { textDecorationLine: "line-through" },
        ]}
      >
        {todo.title}
      </Text>
    </View>
    <TouchableOpacity
      onPress={() => {
        deleteTodo(todo.id);
        alert("Deleted " + todo.id);
      }}
    >
      <Ionicons name="trash" size={24} color={"#FF6B6B"} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#FDF6F0", // sıcak krem
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 10,
    gap: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#3E3E3E", // nötr koyu gri
  },
  todoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E4F0E2", // nane yeşili
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  todoInfoContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  todoText: {
    fontSize: 16,
    color: "#3E3E3E", // koyu gri
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addButton: {
    backgroundColor: "#FFB6B9", // tatlı pembe
    padding: 8,
    borderRadius: 10,
    marginLeft: 20,
  },
  newTodoInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    color: "#3E3E3E",
  },
});
