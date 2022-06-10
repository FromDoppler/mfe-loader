# MFE Loader

_MFE Loader_ is a tool to support an indirection layer between HTML files and his JavaScript and CSS dependencies, allowing us to deploy new versions of our _micro-frontends_ without modifying the HTML files where they are used.

In the HTML files, this loader is included and then used to load the entry points referenced in some _asset-manifest_ files, for example:

```html
<!-- https://app.fromdoppler.com/editors/ -->
<!DOCTYPE html>
<html>
  <head>
    <!-- . . . -->
    <script src="https://cdn.fromdoppler.com/mfe-loader/loader-v1.1.0.js"></script>
    <script type="text/javascript">
      assetServices.load({
        manifestURL:
          "https://cdn.fromdoppler.com/doppler-style-guide/asset-manifest-v1.json",
      });
      assetServices.load({
        manifestURL:
          "https://cdn.fromdoppler.com/editors-webapp/asset-manifest-v1.json",
      });
    </script>
    <!-- . . . -->
  </head>
</html>
```

`assetServices.load` will download the _asset-manifest_ JSON files and then update the DOM to load the _javascript_ and _css_ files referenced in those _manifests_.

![example sequence diagram](https://andresmoschini.github.io/doppler-microfrontends/diagram5-nuevo-editor.png)

See more details in these slides: <https://andresmoschini.github.io/doppler-microfrontends/>.

## How to use it

1. Add the reference to the last version of the loader:

   ```html
   <script src="https://cdn.fromdoppler.com/mfe-loader/loader-{version}.js"></script>
   ```

2. Load the dependencies

   ```html
   <script type="text/javascript">
     // Optional configuration here
     assetServices.load({
       manifestURL: "{asset-manifest-URL}",
     });
   </script>
   ```

### Configure the dependencies

Some dependencies require configuration. In general, we are doing it using global variables defined by convention. For example:

```html
<script type="text/javascript">
  window["editors-webapp-configuration"] = {
    basename: "editors-demo",
    unlayerProjectId: 32092,
    htmlEditorApiBaseUrl: "https://apis.fromdoppler.com/html-editor",
    loginPageUrl: "https://app.fromdoppler.com/login"
  };

  assetServices.load({
    // . . .
</script>
```

### `assetServices.load()`

```typescript
interface IAssetServices {
  load({
    manifestURL,
    sources,
  }: {
    manifestURL: string;
    sources?: string[];
  }): Promise<void>;
  // . . .
}
```

**Parameters:**

- `manifestURL`: It is the URL of the _asset-manifest_.

- `sources`: A optional list of JavaScript or CSS resources that will be loaded after the files referenced in the _asset-manifest_.

**Result:**

It returns a promise. The promise is fulfilled when the _asset-manifest_ is loaded and the DOM updated. It does not warrant that the files referenced in the _asset-manifest_ have been loaded yet.
