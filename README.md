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
