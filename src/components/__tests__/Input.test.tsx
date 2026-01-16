import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Input} from '../Input';
import {Text} from 'react-native';

describe('Input Component', () => {
  it('renders correctly', () => {
    const {getByPlaceholderText} = render(
      <Input placeholder="Enter text" />,
    );
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('handles text input', () => {
    const onChangeTextMock = jest.fn();
    const {getByPlaceholderText} = render(
      <Input placeholder="Type here" onChangeText={onChangeTextMock} />,
    );

    const input = getByPlaceholderText('Type here');
    fireEvent.changeText(input, 'Hello World');
    expect(onChangeTextMock).toHaveBeenCalledWith('Hello World');
  });

  it('renders with icon', () => {
    const TestIcon = () => <Text testID="test-icon">Icon</Text>;
    const {getByTestId, getByPlaceholderText} = render(
      <Input placeholder="With icon" icon={<TestIcon />} />,
    );
    expect(getByTestId('test-icon')).toBeTruthy();
    expect(getByPlaceholderText('With icon')).toBeTruthy();
  });

  it('applies custom container style', () => {
    const customStyle = {borderColor: 'red'};
    const {getByPlaceholderText} = render(
      <Input placeholder="Styled" containerStyle={customStyle} />,
    );
    expect(getByPlaceholderText('Styled')).toBeTruthy();
  });

  it('applies custom input style', () => {
    const customStyle = {fontSize: 18};
    const {getByPlaceholderText} = render(
      <Input placeholder="Custom font" style={customStyle} />,
    );
    expect(getByPlaceholderText('Custom font')).toBeTruthy();
  });

  it('passes additional TextInput props', () => {
    const {getByPlaceholderText} = render(
      <Input
        placeholder="Secure input"
        secureTextEntry={true}
        maxLength={10}
      />,
    );
    const input = getByPlaceholderText('Secure input');
    expect(input.props.secureTextEntry).toBe(true);
    expect(input.props.maxLength).toBe(10);
  });

  it('sets correct placeholder color', () => {
    const {getByPlaceholderText} = render(
      <Input placeholder="Placeholder test" />,
    );
    const input = getByPlaceholderText('Placeholder test');
    expect(input.props.placeholderTextColor).toBe('#999999');
  });

  it('handles keyboard types', () => {
    const {getByPlaceholderText} = render(
      <Input placeholder="Email" keyboardType="email-address" />,
    );
    const input = getByPlaceholderText('Email');
    expect(input.props.keyboardType).toBe('email-address');
  });

  it('handles auto-capitalization', () => {
    const {getByPlaceholderText} = render(
      <Input placeholder="Name" autoCapitalize="words" />,
    );
    const input = getByPlaceholderText('Name');
    expect(input.props.autoCapitalize).toBe('words');
  });

  it('handles focus and blur events', () => {
    const onFocusMock = jest.fn();
    const onBlurMock = jest.fn();
    const {getByPlaceholderText} = render(
      <Input
        placeholder="Focus test"
        onFocus={onFocusMock}
        onBlur={onBlurMock}
      />,
    );

    const input = getByPlaceholderText('Focus test');
    fireEvent(input, 'focus');
    expect(onFocusMock).toHaveBeenCalled();

    fireEvent(input, 'blur');
    expect(onBlurMock).toHaveBeenCalled();
  });
});
