window.AssetServices = function () {
  const ensureAbsoluteURLs = (baseURL, entrypoints) => {
    const regExpIsAbsoluteURL = new RegExp("^(?:[a-z]+:)?//", "i");
    return entrypoints.map(function (entrypoint) {
      if (!regExpIsAbsoluteURL.test(entrypoint)) {
        return baseURL + entrypoint;
      }
      return entrypoint;
    });
  };
  const addRef = (entrypoint) => {
    const pattern = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gim;
    // eslint-disable-next-line default-case
    switch (entrypoint.match(pattern)[0]) {
      case ".css":
        let link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = entrypoint;
        link.async = false;
        document.head.appendChild(link);
        break;
      case ".js":
        let script = document.createElement("script");
        script.src = entrypoint;
        script.async = false;
        document.body.appendChild(script);
        break;
    }
  };
  const load = (manifestURL, sources = []) => {
    fetch(manifestURL)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        const entrypoints = ensureAbsoluteURLs(
          manifestURL.substring(0, manifestURL.lastIndexOf("/") + 1),
          data.entrypoints
        );
        entrypoints.concat(sources).forEach((entrypoint) => {
          addRef(entrypoint);
        });
      })
      .catch(function () {
        throw new Error("Error getting assets file: " + manifestURL);
      });
  };
  return { load: load };
};
