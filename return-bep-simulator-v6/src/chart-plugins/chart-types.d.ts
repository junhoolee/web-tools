import 'chart.js';

interface VLineOptions {
  retWindowDay?: number;
}

interface VolumeMarkerOptions {
  retWindowDay?: number;
}

interface BepVolLineOptions {
  bepVolume?: number | null;
}

declare module 'chart.js' {
  interface PluginOptionsByType<_TType> {
    vlines?: VLineOptions;
    volumeMarker?: VolumeMarkerOptions;
    bepVolLine?: BepVolLineOptions;
  }
}
