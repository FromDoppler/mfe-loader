type Options = Readonly<{ forceScriptModuleType: boolean }>;

const defaultOptions: Options = {
  forceScriptModuleType: false,
};

async function getEntrypoints({
  fetch,
  manifestURL,
}: {
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  manifestURL: string;
}): Promise<string[]> {
  const response = await fetch(manifestURL);
  const data = await response.json();
  const entrypoints = ensureAbsoluteURLs(
    manifestURL.substring(0, manifestURL.lastIndexOf("/") + 1),
    data.entrypoints,
  );
  return entrypoints;
}

function addEntrypointReferencesToDOM({
  document,
  entrypoints,
  referenceNode,
  options,
}: {
  document: Document;
  entrypoints: string[];
  referenceNode: Node;
  options: Options;
}): void {
  entrypoints
    .map((entrypoint) => createElement({ document, entrypoint, options }))
    .filter((x): x is HTMLElement => !!x)
    .forEach((element) => {
      addElementBefore({ element, referenceNode });
    });
}

function ensureAbsoluteURLs(baseURL: string, entrypoints: string[]) {
  const regExpIsAbsoluteURL = new RegExp("^(?:[a-z]+:)?//", "i");
  return entrypoints.map(function (entrypoint) {
    if (!regExpIsAbsoluteURL.test(entrypoint)) {
      return baseURL + entrypoint;
    }
    return entrypoint;
  });
}

function createElement({
  document,
  entrypoint,
  options,
}: {
  document: Document;
  entrypoint: string;
  options: Options;
}): HTMLElement | null {
  const pattern = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gim;
  switch (entrypoint.match(pattern)![0]) {
    case ".css":
      let link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = entrypoint;
      (link as any).async = false; // TODO: it seems to be superfluous, remove
      return link;
    case ".js":
      let script = document.createElement("script");
      script.src = entrypoint;
      script.async = false;
      if (options.forceScriptModuleType) {
        script.type = "module";
      }
      return script;
    default:
      console.warn(`Unexpected entrypoint extension: ${entrypoint}`);
      return null;
  }
}

function addElementBefore({
  element,
  referenceNode,
}: {
  element: HTMLElement;
  referenceNode: Node;
}) {
  referenceNode.parentNode!.insertBefore(element, referenceNode);
}

async function load({
  fetch,
  document,
  manifestURL,
  sources,
  referenceNode,
  options,
}: {
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  document: Document;
  manifestURL: string;
  sources: string[];
  referenceNode: Node;
  options: Options;
}): Promise<void> {
  // TODO: DE-667 - improve error handling
  // Consider using Loggly
  // Consider applying retries
  // Consider allowing run fallback code
  const manifestEntrypoints = await getEntrypoints({ fetch, manifestURL });
  const entrypoints = manifestEntrypoints.concat(sources);
  addEntrypointReferencesToDOM({
    document,
    entrypoints,
    referenceNode,
    options,
  });
}

function normalizeArgs(
  arg1:
    | string
    | {
        manifestURL: string;
        sources?: string[];
        referenceNode?: Node;
        options?: Partial<Options>;
      },
  arg2: string[] | undefined,
) {
  let manifestURL: string;
  let sources: string[];
  let referenceNode: Node | undefined;
  let partialOptions: Partial<Options>;
  if (typeof arg1 == "object") {
    manifestURL = arg1.manifestURL;
    sources = arg1.sources ?? [];
    referenceNode = arg1.referenceNode;
    partialOptions = arg1.options ?? {};
  } else {
    manifestURL = arg1;
    sources = arg2 ?? [];
    partialOptions = {};
  }
  const options: Options = { ...defaultOptions, ...partialOptions };
  return { manifestURL, sources, referenceNode, options };
}

interface IAssetServices {
  /** @deprecated use object literal overload instead */
  load(manifestURL: string, sources?: string[]): Promise<void>;
  load({
    manifestURL,
    sources,
    referenceNode,
  }: {
    manifestURL: string;
    sources?: string[];
    /** the new elements will be added before this one */
    referenceNode?: Node;
  }): Promise<void>;
  getEntrypoints({ manifestURL }: { manifestURL: string }): Promise<string[]>;
}

export class AssetServices implements IAssetServices {
  private _fetch: (
    input: RequestInfo,
    init?: RequestInit | undefined,
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

  async load(
    arg1:
      | string
      | {
          manifestURL: string;
          sources?: string[];
          referenceNode?: Node;
          options?: Partial<Options>;
        },
    arg2?: string[],
  ): Promise<void> {
    const {
      manifestURL,
      sources,
      referenceNode = this._document.currentScript ||
        this._document.head.firstChild ||
        this._document.body,
      options,
    } = normalizeArgs(arg1, arg2);

    return load({
      fetch: this._fetch,
      document: this._document,
      manifestURL,
      sources,
      referenceNode,
      options,
    });
  }

  async getEntrypoints({
    manifestURL,
  }: {
    manifestURL: string;
  }): Promise<string[]> {
    return getEntrypoints({
      fetch: this._fetch,
      manifestURL,
    });
  }
}
