module.exports = {
    dependencies: {
        // Exclude Expo from autolinking
        expo: {
            platforms: {
                ios: null,
                android: null,
            },
        },
    },
    project: {
        ios: {
            // Temporarily disable Hermes to fix build issues
            unstable_reactLegacyComponentNames: [],
        },
    },
};