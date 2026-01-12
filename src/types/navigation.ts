export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Friends: undefined;
  Camera: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeFeed: undefined;
  VideoView: {videoId: string; userId: string};
  Search: undefined;
  UserProfile: {userId: string};
};

export type MessagesStackParamList = {
  MessagesList: undefined;
  Chat: {chatId: string; userName: string; userAvatar?: string};
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
  Appearance: undefined;
  Privacy: undefined;
  Help: undefined;
  About: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
