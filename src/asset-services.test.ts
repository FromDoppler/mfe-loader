import { AssetServices } from "./asset-services";

describe(AssetServices.name, () => {
  describe("Ctor", () => {
    // This makes honor to Loader V1's behavior
    it("should use global dependencies when is executed without parameters", () => {
      // Act
      const instance = new AssetServices();

      // Assert
      expect((instance as any)._fetch).toBe(window.fetch);
      expect((instance as any)._document).toBe(window.document);
    });

    it("should use parameters as dependencies when they are specified", () => {
      // Arrange
      const dependencies: any = {
        fetch: {},
        document: {},
      };

      // Act
      const instance = new AssetServices(dependencies);

      // Assert
      expect((instance as any)._fetch).toBe(dependencies.fetch);
      expect((instance as any)._document).toBe(dependencies.document);
    });
  });

  describe("load", () => {
    it("should load manifest from specified URL", async () => {
      // Arrange
      const manifestURL =
        "https://cdn.fromdoppler.com/test/asset-manifest-v1.json";
      const responseJson = {
        entrypoints: [],
      };
      const windowMoq = createWindowMoq(responseJson);
      const instance = new AssetServices(windowMoq as any);

      // Act
      await instance.load(manifestURL);

      // Assert
      expect(windowMoq.fetch).toHaveBeenCalledTimes(1);
      expect(windowMoq.fetch).toHaveBeenCalledWith(manifestURL);
    });

    it("should update create elements for javascript files", async () => {
      // Arrange
      const manifestURL =
        "https://cdn.fromdoppler.com/test/asset-manifest-v1.json";
      const responseJson = {
        entrypoints: [
          "static/js/main.cf47d9fd.js",
          "https://absolute/absolute.js",
        ],
      };
      const expectedCreatedScriptElements = responseJson.entrypoints.length;
      const windowMoq = createWindowMoq(responseJson);
      const instance = new AssetServices(windowMoq as any);

      // Act
      await instance.load(manifestURL);

      // Assert
      expect(windowMoq.document.createElement).toHaveBeenCalledWith("script");
      expect(windowMoq.document.createElement).toHaveBeenCalledTimes(
        expectedCreatedScriptElements
      );
    });

    it("should update create elements for css files", async () => {
      // Arrange
      const manifestURL =
        "https://cdn.fromdoppler.com/test/asset-manifest-v1.json";
      const responseJson = {
        entrypoints: [
          "https://absolute/absolute.css",
          "static/js/main.cf47d9fd.css",
        ],
      };
      const expectedCreatedLinkElements = responseJson.entrypoints.length;
      const windowMoq = createWindowMoq(responseJson);
      const instance = new AssetServices(windowMoq as any);

      // Act
      await instance.load(manifestURL);

      // Assert
      expect(windowMoq.document.createElement).toHaveBeenCalledWith("link");
      expect(windowMoq.document.createElement).toHaveBeenCalledTimes(
        expectedCreatedLinkElements
      );
    });

    it("should append elements from manifest and sources to the DOM", async () => {
      // Arrange
      const manifestURL =
        "https://cdn.fromdoppler.com/test/asset-manifest-v1.json";
      const responseJson = {
        entrypoints: [
          "static/css/main.e6c13ad2.css",
          "static/js/main.cf47d9fd.js",
          "https://absolute/file3.css",
        ],
      };
      const sources = [
        "relativeSource.js",
        "https://absolute/absoluteSource.css",
      ];
      const expectedJsAppendUrls = [
        "https://cdn.fromdoppler.com/test/static/js/main.cf47d9fd.js",
        "relativeSource.js", // It should continue as relative
      ];
      const expectedCssAppendUrls = [
        "https://cdn.fromdoppler.com/test/static/css/main.e6c13ad2.css",
        "https://absolute/file3.css",
        "https://absolute/absoluteSource.css",
      ];
      const windowMoq = createWindowMoq(responseJson);
      const instance = new AssetServices(windowMoq as any);

      // Act
      await instance.load(manifestURL, sources);

      // Assert
      expect(windowMoq.document.body.appendChild).toHaveBeenCalledTimes(
        expectedJsAppendUrls.length
      );
      expectedJsAppendUrls.forEach((url) => {
        expect(windowMoq.document.body.appendChild).toHaveBeenCalledWith({
          async: false,
          src: url,
        });
      });
      expect(windowMoq.document.head.appendChild).toHaveBeenCalledTimes(
        expectedCssAppendUrls.length
      );
      expectedCssAppendUrls.forEach((url) => {
        expect(windowMoq.document.head.appendChild).toHaveBeenCalledWith({
          rel: "stylesheet",
          async: false,
          href: url,
        });
      });
    });
  });
});

function createWindowMoq(responseJson: { entrypoints: string[] }) {
  return {
    fetch: jest.fn(() => ({
      json: jest.fn(() => Promise.resolve(responseJson)),
    })),
    document: {
      createElement: jest.fn(() => ({})),
      body: {
        appendChild: jest.fn(),
      },
      head: {
        appendChild: jest.fn(),
      },
    },
  };
}
