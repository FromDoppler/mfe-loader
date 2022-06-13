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
    expect(instance._fetch).toBe(window.fetch);
    expect(instance._document).toBe(window.document);
  });

  describe("Created global class AssetServices", () => {
    const windowDouble: any = {};
    const className = "AssetServices";
    addAssetServicesToWindow(windowDouble);

    // This makes honor to Loader V1's behavior
    it("should use global dependencies when is instantiated without parameters", () => {
      // Act
      const instance = new windowDouble[className]();

      // Assert
      expect(instance._fetch).toBe(window.fetch);
      expect(instance._document).toBe(window.document);
    });

    it("should use constructor parameters as dependencies when they are specified", () => {
      // Arrange
      const dependencies: any = {
        fetch: {},
        document: {},
      };

      // Act
      const instance = new windowDouble[className](dependencies);

      // Assert
      expect(instance._fetch).toBe(dependencies.fetch);
      expect(instance._document).toBe(dependencies.document);
    });
  });

  it("should create global namespace assetServices with specified dependencies", () => {
    // Arrange
    const windowDouble: any = {
      fetch: {},
      document: {},
    };
    const namespaceName = "assetServices";

    // Act
    addAssetServicesToWindow(windowDouble);

    // Assert
    expect(windowDouble).toHaveProperty(namespaceName);
    expect(windowDouble[namespaceName]).toBeInstanceOf(Object);
    expect(windowDouble[namespaceName]).toHaveProperty("load");
    expect(windowDouble[namespaceName].load).toBeInstanceOf(Function);
    expect(windowDouble[namespaceName]._fetch).toBe(windowDouble.fetch);
    expect(windowDouble[namespaceName]._document).toBe(windowDouble.document);
  });
});
