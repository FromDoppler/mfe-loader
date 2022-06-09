import { AssetServices } from "./asset-services";

export function addAssetServicesToWindow(window: Window) {
  (window as any).AssetServices = AssetServices;
}
