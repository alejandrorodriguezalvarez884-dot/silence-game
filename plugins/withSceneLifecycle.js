// Adopts the UIKit scene life cycle, which apps built with the iOS 27 SDK need or they crash at launch
// ("UIScene life cycle is required for apps built with this SDK"). The SDK 57 native template still
// starts React Native from the app delegate; this ports the SDK 58 template's SceneDelegate on top of
// the ExpoAppSceneDelegate that the `expo` package already ships.
const fs = require('fs');
const path = require('path');
const { IOSConfig, withAppDelegate, withDangerousMod, withInfoPlist, withXcodeProject } = require('expo/config-plugins');

const SCENE_DELEGATE = `internal import Expo

@objc(SceneDelegate)
class SceneDelegate: ExpoAppSceneDelegate {
  // Extension point for config plugins.
}
`;

const withSceneManifest = (config) =>
  withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return config;
  });

// The scene delegate creates the window and starts React Native, so the app delegate only builds the
// factory and exposes it through ExpoReactNativeFactoryProvider.
const withSceneAppDelegate = (config) =>
  withAppDelegate(config, (config) => {
    if (config.modResults.language !== 'swift') throw new Error('withSceneLifecycle expects a Swift AppDelegate');
    let src = config.modResults.contents;
    src = src.replace(/class AppDelegate: ExpoAppDelegate \{/, 'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {');
    src = src.replace(
      /\n#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n\s*factory\.startReactNative\([\s\S]*?\)\n#endif\n/,
      '\n    // The window is created and React Native is started by `SceneDelegate`.\n',
    );
    if (!src.includes('ExpoReactNativeFactoryProvider') || src.includes('UIScreen.main.bounds')) {
      throw new Error('withSceneLifecycle could not patch AppDelegate.swift; the template has changed');
    }
    config.modResults.contents = src;
    return config;
  });

const withSceneDelegateFile = (config) => {
  config = withDangerousMod(config, [
    'ios',
    (config) => {
      const dir = path.join(config.modRequest.platformProjectRoot, config.modRequest.projectName);
      fs.writeFileSync(path.join(dir, 'SceneDelegate.swift'), SCENE_DELEGATE);
      return config;
    },
  ]);
  return withXcodeProject(config, (config) => {
    const name = config.modRequest.projectName;
    const filepath = `${name}/SceneDelegate.swift`;
    if (!config.modResults.hasFile(filepath)) {
      IOSConfig.XcodeUtils.addBuildSourceFileToGroup({ filepath, groupName: name, project: config.modResults });
    }
    return config;
  });
};

module.exports = (config) => withSceneDelegateFile(withSceneAppDelegate(withSceneManifest(config)));
