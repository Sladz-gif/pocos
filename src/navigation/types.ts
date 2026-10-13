import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  RanchLogin: undefined;
  RanchOwnerLogin: undefined;
  RanchOwnerSignUp: undefined;
  ConsumerSignUp: undefined;
  ConsumerSignIn: undefined;
  DeviceHealthCheck: undefined;
};

export type RanchTabParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  FlockStack: NavigatorScreenParams<FlockStackParamList>;
  TasksStack: NavigatorScreenParams<TasksStackParamList>;
  ChatStack: NavigatorScreenParams<ChatStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  ManageTeam: undefined;
  OnboardStaff: undefined;
  StaffActivity: undefined;
  Analytics: undefined;
  ManageRanchProfile: undefined;
  ProfileHome: undefined;
  NotificationSettings: undefined;
  HelpSupport: undefined;
  PricingPlans: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  StaffActivityMonitor: undefined;
  AdminPanel: undefined; // Modal stack entry
};

export type FlockStackParamList = {
  Flock: undefined;
  AnimalDetail: { id: string };
  AddAnimal: { animalType?: string };
  AncestryTree: { id: string };
  ProfileDetail: { id: string };
  BirdCount: { profileId: string } | undefined;
  AddBirdProfile: { profileId: string } | undefined;
  BirdProfileDetail: { id: string };
  CreateProfile: undefined;
  SelectAnimalType: undefined;
};

export type TasksStackParamList = {
  TaskBoard: undefined;
  TaskDetail: { id: string };
  CreateTask: undefined;
};

export type ChatStackParamList = {
  ChatHome: undefined;
  Conversation: { id: string };
};

export type AdminStackParamList = {
  AdminPanelHome: undefined;
  ManageTeam: undefined;
  OnboardStaff: undefined;
  StaffActivity: undefined;
  Analytics: undefined;
  ManageRanchProfile: undefined;
  DeviceHealthCheck: undefined;
  ProfileHome: undefined;
  NotificationSettings: undefined;
  HelpSupport: undefined;
  PricingPlans: undefined;
};

export type MarketplaceTabParamList = {
  BrowseStack: NavigatorScreenParams<BrowseStackParamList>;
  Saved: undefined;
  OrdersStack: NavigatorScreenParams<OrdersStackParamList>;
  ProfileStack: NavigatorScreenParams<ProfileStackParamList>;
};

export type OrdersStackParamList = {
  OrdersList: undefined;
  Conversation: { id: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  DeliveryAddresses: undefined;
  PaymentMethods: undefined;
};

export type BrowseStackParamList = {
  BrowseHome: undefined;
  ProductDetail: { id: string };
  RanchProfile: { id: string };
  AllProducts: undefined;
  Cart: undefined;
  Checkout: { items: any[]; total: number };
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  RanchApp: NavigatorScreenParams<RanchTabParamList>;
  Marketplace: NavigatorScreenParams<MarketplaceTabParamList>;
  AdminModal: NavigatorScreenParams<AdminStackParamList>;
};
