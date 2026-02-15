const { withAndroidStyles } = require('@expo/config-plugins');

module.exports = function withCustomStyles(config) {
  return withAndroidStyles(config, (config) => {
    const styles = config.modResults;
    
    // Trouver le style AppTheme
    const appTheme = styles.resources.style.find(
      (style) => style.$.name === 'AppTheme'
    );
    
    if (appTheme) {
      // Ajouter le support des encoches (notch)
      appTheme.item.push({
        $: { name: 'android:windowLayoutInDisplayCutoutMode' },
        _: 'shortEdges',
      });
      
      // Couleur de la barre de navigation
      appTheme.item.push({
        $: { name: 'android:navigationBarColor' },
        _: '#161022',
      });
    }
    
    return config;
  });
};
