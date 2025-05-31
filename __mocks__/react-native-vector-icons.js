/**
 * =================================================================
 * REACT NATIVE VECTOR ICONS MOCK
 * =================================================================
 * 
 * Mock implementation of React Native Vector Icons for testing
 */

const MaterialIcons = (props) => `MockedMaterialIcon-${props.name}`;
MaterialIcons.getImageSource = jest.fn(() => Promise.resolve({}));
MaterialIcons.getImageSourceSync = jest.fn(() => ({}));

const FontAwesome = (props) => `MockedFontAwesome-${props.name}`;
FontAwesome.getImageSource = jest.fn(() => Promise.resolve({}));
FontAwesome.getImageSourceSync = jest.fn(() => ({}));

const Ionicons = (props) => `MockedIonicons-${props.name}`;
Ionicons.getImageSource = jest.fn(() => Promise.resolve({}));
Ionicons.getImageSourceSync = jest.fn(() => ({}));

// Default export (for generic imports)
const MockIcon = (props) => `MockedIcon-${props.name || 'unknown'}`;
MockIcon.getImageSource = jest.fn(() => Promise.resolve({}));
MockIcon.getImageSourceSync = jest.fn(() => ({}));

module.exports = MockIcon;
module.exports.MaterialIcons = MaterialIcons;
module.exports.FontAwesome = FontAwesome;
module.exports.Ionicons = Ionicons;
