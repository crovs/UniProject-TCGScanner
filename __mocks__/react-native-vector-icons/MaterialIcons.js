/**
 * =================================================================
 * REACT NATIVE VECTOR ICONS MATERIAL ICONS MOCK
 * =================================================================
 * 
 * Mock implementation of MaterialIcons specifically
 */

const MaterialIcons = (props) => `MockedMaterialIcon-${props.name}`;
MaterialIcons.getImageSource = jest.fn(() => Promise.resolve({}));
MaterialIcons.getImageSourceSync = jest.fn(() => ({}));

module.exports = MaterialIcons;
