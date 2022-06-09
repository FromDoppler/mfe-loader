import { addAssetServicesToWindow } from "./initializer";

describe(addAssetServicesToWindow.name, () => {
  it("should create global class AssetServices", () => {
    // Arrange
    const windowDouble: any = {};
    const className = "AssetServices";

    // Act
    addAssetServicesToWindow(windowDouble);

    // Assert
    expect(windowDouble).toHaveProperty(className);
    expect(windowDouble[className]).toBeInstanceOf(Function);
    expect(windowDouble[className]).toHaveProperty("prototype");
    const instance = new windowDouble[className]();
    expect(instance).toBeDefined();
    expect(instance).toHaveProperty("load");
    expect(instance.load).toBeInstanceOf(Function);
  });
});
