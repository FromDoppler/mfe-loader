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

  describe.each([
    {
      description: "deprecated",
      act: (
        instance: AssetServices,
        { manifestURL, sources }: { manifestURL: string; sources?: string[] }
      ) => instance.load(manifestURL, sources),
    },
    {
      description: "with object literal parameter",
      act: (
        instance: AssetServices,
        parameters: { manifestURL: string; sources?: string[] }
      ) => instance.load(parameters),
    },
  ])("load ($description)", ({ act }) => {
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
      await act(instance, { manifestURL });

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
      await act(instance, { manifestURL });

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
      await act(instance, { manifestURL });

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
      await act(instance, { manifestURL, sources });

      // Assert
      expect(
        windowMoq.document.currentScript.parentNode.insertBefore
      ).toHaveBeenCalledTimes(
        expectedJsAppendUrls.length + expectedCssAppendUrls.length
      );
      expectedJsAppendUrls.forEach((url) => {
        expect(
          windowMoq.document.currentScript.parentNode.insertBefore
        ).toHaveBeenCalledWith(
          {
            async: false,
            src: url,
          },
          windowMoq.document.currentScript
        );
      });
      expectedCssAppendUrls.forEach((url) => {
        expect(
          windowMoq.document.currentScript.parentNode.insertBefore
        ).toHaveBeenCalledWith(
          {
            rel: "stylesheet",
            async: false,
            href: url,
          },
          windowMoq.document.currentScript
        );
      });
    });

    it("should append elements to the beginning of the head when currentScript is not defined", async () => {
      // Arrange
      const manifestURL =
        "https://cdn.fromdoppler.com/test/asset-manifest-v1.json";
      const responseJson = {
        entrypoints: ["static/css/main.e6c13ad2.css"],
      };
      const windowMoq = createWindowMoq(responseJson);
      (windowMoq.document as any).currentScript = null;

      const instance = new AssetServices(windowMoq as any);

      // Act
      await act(instance, { manifestURL });

      // Assert
      expect(
        windowMoq.document.head.firstChild.parentNode.insertBefore
      ).toHaveBeenCalled();
    });

    it("should append elements before body when currentScript is not defined and head is empty", async () => {
      // Arrange
      const manifestURL =
        "https://cdn.fromdoppler.com/test/asset-manifest-v1.json";
      const responseJson = {
        entrypoints: ["static/css/main.e6c13ad2.css"],
      };
      const windowMoq = createWindowMoq(responseJson);
      (windowMoq.document as any).currentScript = null;
      (windowMoq.document as any).head = {};

      const instance = new AssetServices(windowMoq as any);

      // Act
      await act(instance, { manifestURL });

      // Assert
      expect(
        windowMoq.document.body.parentNode.insertBefore
      ).toHaveBeenCalled();
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
        parentNode: {
          insertBefore: jest.fn(),
        },
      },
      head: {
        firstChild: {
          parentNode: {
            insertBefore: jest.fn(),
          },
        },
      },
      currentScript: {
        parentNode: {
          insertBefore: jest.fn(),
        },
      },
    },
  };
}
