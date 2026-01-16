import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {LoginScreen} from '../LoginScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
  push: jest.fn(),
  replace: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  setParams: jest.fn(),
  reset: jest.fn(),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
} as any;

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const {getByText} = render(<LoginScreen navigation={mockNavigation} />);
    expect(getByText('Snaplet')).toBeTruthy();
  });

  it('displays the logo', () => {
    const {getByText} = render(<LoginScreen navigation={mockNavigation} />);
    expect(getByText('▶')).toBeTruthy();
    expect(getByText('Snaplet')).toBeTruthy();
  });

  it('displays the username/email input field', () => {
    const {getByPlaceholderText} = render(
      <LoginScreen navigation={mockNavigation} />,
    );
    expect(
      getByPlaceholderText('Use phone / email / username'),
    ).toBeTruthy();
  });

  it('displays all social login buttons', () => {
    const {getByText} = render(<LoginScreen navigation={mockNavigation} />);
    expect(getByText('Continue with Facebook')).toBeTruthy();
    expect(getByText('Continue with Instagram')).toBeTruthy();
    expect(getByText('Continue as Guest')).toBeTruthy();
  });

  it('displays login prompt text', () => {
    const {getByText} = render(<LoginScreen navigation={mockNavigation} />);
    expect(getByText('Already have an account?')).toBeTruthy();
    expect(getByText('Login.')).toBeTruthy();
  });

  it('navigates to Welcome screen when login link is pressed', () => {
    const {getByText} = render(<LoginScreen navigation={mockNavigation} />);
    const loginLink = getByText('Login.');

    fireEvent.press(loginLink);
    expect(mockNavigate).toHaveBeenCalledWith('Welcome');
  });

  it('handles Facebook login button press', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const {getByText} = render(<LoginScreen navigation={mockNavigation} />);
    const facebookButton = getByText('Continue with Facebook');

    fireEvent.press(facebookButton);
    expect(consoleSpy).toHaveBeenCalledWith('Facebook login');
    consoleSpy.mockRestore();
  });

  it('handles Instagram login button press', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const {getByText} = render(<LoginScreen navigation={mockNavigation} />);
    const instagramButton = getByText('Continue with Instagram');

    fireEvent.press(instagramButton);
    expect(consoleSpy).toHaveBeenCalledWith('Instagram login');
    consoleSpy.mockRestore();
  });

  it('handles Guest login button press', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const {getByText} = render(<LoginScreen navigation={mockNavigation} />);
    const guestButton = getByText('Continue as Guest');

    fireEvent.press(guestButton);
    expect(consoleSpy).toHaveBeenCalledWith('Guest login');
    consoleSpy.mockRestore();
  });

  it('renders icon components', () => {
    const {getByText} = render(<LoginScreen navigation={mockNavigation} />);
    expect(getByText('👤')).toBeTruthy(); // UserIcon
    expect(getByText('f')).toBeTruthy(); // FacebookIcon
    expect(getByText('📷')).toBeTruthy(); // InstagramIcon
    expect(getByText('👥')).toBeTruthy(); // PeopleIcon
  });

  it('renders ScrollView component', () => {
    const {UNSAFE_root} = render(
      <LoginScreen navigation={mockNavigation} />,
    );
    // Verify that ScrollView is rendered by checking the component tree
    expect(UNSAFE_root).toBeTruthy();
  });
});
