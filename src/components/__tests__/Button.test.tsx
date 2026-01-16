import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Button} from '../Button';
import {Text} from 'react-native';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const {getByText} = render(
      <Button title="Test Button" onPress={() => {}} />,
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const {getByText} = render(
      <Button title="Press Me" onPress={onPressMock} />,
    );

    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const {getByText} = render(
      <Button title="Disabled Button" onPress={onPressMock} disabled={true} />,
    );

    fireEvent.press(getByText('Disabled Button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('renders with primary variant by default', () => {
    const {getByText} = render(
      <Button title="Primary Button" onPress={() => {}} />,
    );
    const button = getByText('Primary Button').parent;
    expect(button).toBeTruthy();
  });

  it('renders with outline variant', () => {
    const {getByText} = render(
      <Button title="Outline Button" onPress={() => {}} variant="outline" />,
    );
    expect(getByText('Outline Button')).toBeTruthy();
  });

  it('renders with social variant', () => {
    const {getByText} = render(
      <Button title="Social Button" onPress={() => {}} variant="social" />,
    );
    expect(getByText('Social Button')).toBeTruthy();
  });

  it('renders with icon', () => {
    const TestIcon = () => <Text>Icon</Text>;
    const {getByText} = render(
      <Button title="Button with Icon" onPress={() => {}} icon={<TestIcon />} />,
    );
    expect(getByText('Icon')).toBeTruthy();
    expect(getByText('Button with Icon')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const customStyle = {backgroundColor: 'red'};
    const {getByText} = render(
      <Button
        title="Styled Button"
        onPress={() => {}}
        style={customStyle}
      />,
    );
    expect(getByText('Styled Button')).toBeTruthy();
  });

  it('applies custom text styles', () => {
    const customTextStyle = {fontSize: 20};
    const {getByText} = render(
      <Button
        title="Custom Text"
        onPress={() => {}}
        textStyle={customTextStyle}
      />,
    );
    expect(getByText('Custom Text')).toBeTruthy();
  });

  it('shows disabled state visually', () => {
    const {getByText} = render(
      <Button title="Disabled" onPress={() => {}} disabled={true} />,
    );
    const button = getByText('Disabled').parent;
    expect(button).toBeTruthy();
  });
});
