import { AssetServices } from "./asset-services";

export function addAssetServicesToWindow(window: Window) {
  (window as any).assetServices = new AssetServices();
  /** @deprecated use assetServices namespace instead */
  (window as any).AssetServices = AssetServices;
}
