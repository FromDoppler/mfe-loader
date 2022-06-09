function ensureAbsoluteURLs(baseURL: string, entrypoints: string[]) {
  const regExpIsAbsoluteURL = new RegExp("^(?:[a-z]+:)?//", "i");
  return entrypoints.map(function (entrypoint) {
    if (!regExpIsAbsoluteURL.test(entrypoint)) {
      return baseURL + entrypoint;
    }
    return entrypoint;
  });
}

function addRef(document: Document, entrypoint: string) {
  const pattern = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gim;
  switch (entrypoint.match(pattern)![0]) {
    case ".css":
      let link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = entrypoint;
      (link as any).async = false;
      document.head.appendChild(link);
      break;
    case ".js":
      let script = document.createElement("script");
      script.src = entrypoint;
      script.async = false;
      document.body.appendChild(script);
      break;
    default:
      // do nothing
      break;
  }
}

async function load({
  fetch,
  document,
  manifestURL,
  sources,
}: {
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  document: Document;
  manifestURL: string;
  sources: string[];
}): Promise<void> {
  try {
    const response = await fetch(manifestURL);
    const data = await response.json();
    const entrypoints = ensureAbsoluteURLs(
      manifestURL.substring(0, manifestURL.lastIndexOf("/") + 1),
      data.entrypoints
    );
    entrypoints.concat(sources).forEach((entrypoint) => {
      addRef(document, entrypoint);
    });
  } catch (error) {
    throw new Error("Error getting assets file: " + manifestURL);
  }
}

interface IAssetServices {
  load(manifestURL: string, sources?: string[]): Promise<void>;
}

export class AssetServices implements IAssetServices {
  private _fetch: (
    input: RequestInfo,
    init?: RequestInit | undefined
  ) => Promise<Response>;
  private _document: Document;

  constructor({
    fetch,
    document,
  }: {
    fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
    document: Document;
  } = window) {
    this._fetch = fetch;
    this._document = document;
  }

  load(manifestURL: string, sources: string[] = []) {
    return load({
      fetch: this._fetch,
      document: this._document,
      manifestURL,
      sources,
    });
  }
}
