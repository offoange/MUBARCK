const { withEntitlementsPlist, withInfoPlist } = require('@expo/config-plugins');

const withDisablePushNotifications = (config) => {
  // Supprimer les entitlements push
  config = withEntitlementsPlist(config, (config) => {
    // Supprimer aps-environment (push notifications)
    delete config.modResults['aps-environment'];
    return config;
  });

  // Supprimer UIBackgroundModes remote-notification
  config = withInfoPlist(config, (config) => {
    if (config.modResults.UIBackgroundModes) {
      config.modResults.UIBackgroundModes = config.modResults.UIBackgroundModes.filter(
        (mode) => mode !== 'remote-notification'
      );
      // Si le tableau est vide, le supprimer
      if (config.modResults.UIBackgroundModes.length === 0) {
        delete config.modResults.UIBackgroundModes;
      }
    }
    return config;
  });

  return config;
};

module.exports = withDisablePushNotifications;
