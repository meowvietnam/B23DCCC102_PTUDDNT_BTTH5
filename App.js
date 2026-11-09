import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer, createNavigationContainerRef} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {onAuthStateChanged} from 'firebase/auth';

import {auth} from './src/services/firebase';
import {saveLocation, startPresence, subscribeUsers} from './src/services/userService';
import {subscribeConversations} from './src/services/chatService';
import {
  getActiveChat,
  initNotifications,
  onNotificationPress,
  showMessageNotification,
} from './src/services/notificationService';
import {getCurrentCoords} from './src/services/locationService';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ChatScreen from './src/screens/ChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const navigationRef = createNavigationContainerRef();

// Tổng số tin chưa đọc (cho badge trên tab)
function useUnreadTotal() {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      return;
    }
    return subscribeConversations(uid, list =>
      setTotal(list.reduce((n, c) => n + (c.unread || 0), 0)),
    );
  }, []);
  return total;
}

function MainTabs() {
  const unread = useUnreadTotal();
  const badge = unread > 0 ? (unread > 99 ? '99+' : unread) : undefined;
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size, focused}) => {
          const icons = {
            Home: focused ? 'chatbubbles' : 'chatbubbles-outline',
            Contacts: focused ? 'people' : 'people-outline',
            Notifications: focused ? 'notifications' : 'notifications-outline',
            Settings: focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{title: 'Trò chuyện', tabBarBadge: badge}}
      />
      <Tab.Screen name="Contacts" component={ContactsScreen} options={{title: 'Danh bạ'}} />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{title: 'Thông báo', tabBarBadge: badge}}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{title: 'Cài đặt'}} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, u => {
        setUser(u);
        setInitializing(false);
      }),
    [],
  );

  // Trạng thái online/offline + vị trí khi đã đăng nhập
  useEffect(() => {
    if (!user) {
      return;
    }
    const stop = startPresence(user.uid);
    getCurrentCoords().then(c => c && saveLocation(user.uid, c).catch(() => {}));
    return stop;
  }, [user]);

  // Thông báo khi có tin nhắn mới đến
  useEffect(() => {
    if (!user) {
      return;
    }
    initNotifications();
    let names = {};
    const prev = {};
    let first = true;
    const u1 = subscribeUsers(user.uid, list => {
      names = {};
      list.forEach(u => (names[u.uid] = u.name));
    });
    const u2 = subscribeConversations(user.uid, list => {
      list.forEach(c => {
        const before = prev[c.otherUid] || 0;
        const now = c.unread || 0;
        if (!first && now > before && getActiveChat() !== c.otherUid) {
          showMessageNotification(c.otherUid, names[c.otherUid] || 'Tin nhắn mới', c.lastMessage);
        }
        prev[c.otherUid] = now;
      });
      first = false;
    });
    const u3 = onNotificationPress(d => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('Chat', {uid: d.uid, name: d.name});
      }
    });
    return () => {
      u1();
      u2();
      u3();
    };
  }, [user]);

  if (initializing) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen name="Main" component={MainTabs} options={{headerShown: false}} />
              <Stack.Screen name="Chat" component={ChatScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
              <Stack.Screen name="Register" component={RegisterScreen} options={{title: 'Đăng ký'}} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
