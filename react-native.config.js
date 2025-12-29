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
};