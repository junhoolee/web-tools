import 'chart.js';

interface VLineOptions {
  retWindowDay?: number;
}

interface VolumeMarkerOptions {
  retWindowDay?: number;
}

declare module 'chart.js' {
  interface PluginOptionsByType<_TType> {
    vlines?: VLineOptions;
    volumeMarker?: VolumeMarkerOptions;
  }
}
