import React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TaskListScreen from '../screens/TaskListScreen';
import TaskFormScreen from '../screens/TaskFormScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AppIcon from '../components/AppIcon';
import { colors } from '../theme/theme';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="TaskList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0F172A',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '800',
          },
          cardStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="TaskList"
          component={TaskListScreen}
          options={({ navigation }) => ({
            title: '📋 Task Hub',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('History')}
                style={{ marginRight: 14 }}
              >
                <AppIcon name="history" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="TaskForm"
          component={TaskFormScreen}
          options={({ route }) => ({
            title: route.params?.task ? 'Edit Task' : 'Create Task',
          })}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{
            title: '🗃 History & Reports',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
