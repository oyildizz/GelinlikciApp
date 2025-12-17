const { withAndroidManifest } = require('@expo/config-plugins');

const withAndroid16KB = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const application = androidManifest.manifest.application[0];

    // extractNativeLibs ekle
    application.$['android:extractNativeLibs'] = 'false';

    // meta-data ekle
    if (!application['meta-data']) {
      application['meta-data'] = [];
    }

    // 16 KB meta-data kontrolü
    const has16KBMetadata = application['meta-data'].some(
      (meta) => meta.$['android:name'] === 'android.app.PROPERTY_SUPPORTS_16KB_PAGE_SIZE'
    );

    if (!has16KBMetadata) {
      application['meta-data'].push({
        $: {
          'android:name': 'android.app.PROPERTY_SUPPORTS_16KB_PAGE_SIZE',
          'android:value': 'true',
        },
      });
    }

    return config;
  });
};

module.exports = withAndroid16KB;