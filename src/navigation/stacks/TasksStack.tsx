import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TasksStackParamList } from '../types';
import { TaskBoardScreen } from '../../screens/tasks/TaskBoardScreen';
import { TaskDetailScreen } from '../../screens/tasks/TaskDetailScreen';
import { CreateTaskScreen } from '../../screens/tasks/CreateTaskScreen';
import { TaskHistoryScreen } from '../../screens/tasks/TaskHistoryScreen';

const Stack = createStackNavigator<TasksStackParamList>();

export const TasksStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TaskBoard" component={TaskBoardScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
      <Stack.Screen name="TaskHistory" component={TaskHistoryScreen} />
    </Stack.Navigator>
  );
};
