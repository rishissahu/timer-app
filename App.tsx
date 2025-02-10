import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AddTimerScreen from "./src/screens/AddTimerScreen";
import TimerListScreen from "./src/screens/TimerListScreen";
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const ICONS:any = {
  Home: "home-outline",
  Timers: "timer-outline",
};
function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => (
            <Icon name={ICONS[route.name] || "alert-circle-outline"} size={size} color={color} />
          ),
          tabBarActiveTintColor: "blue",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="Home" component={AddTimerScreen} />
        <Tab.Screen name="Timers" component={TimerListScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
