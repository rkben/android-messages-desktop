import { BehaviorSubject } from "rxjs";
import jetpack from "fs-jetpack";
import { SETTINGS_FILE } from "./constants";

// base types in json
type primative = null | boolean | number | string;
// expression of json arrays
type jsonArr = validJson[];
// recursive interface with all valid expressions of json inside of an object
interface json {
  [key: string]: json | primative | jsonArr;
}

// a complete expression of json including root arrays, primatives, and objects
type validJson = primative | jsonArr | json;

export type Setting<T extends validJson> = BehaviorSubject<T>;

function getSetting(key: string): validJson | undefined {
  return (jetpack.read(SETTINGS_FILE(), "json") || {})[key];
}

/**
 *
 * initial must be a json serializable type
 *
 * @param key name of setting
 * @param initial initial value if unset
 */
function createSetting<T>(key: string, initial: T): BehaviorSubject<T> {
  const savedVal = getSetting(key);
  const val = savedVal != null ? savedVal : initial;
  return new BehaviorSubject(val) as BehaviorSubject<T>;
}

export interface JsonSettings {
  trayEnabled: boolean;
  notificationSoundEnabled: boolean;
  hideNotificationContentEnabled: boolean;
  respectSystemDarkModeEnabled: boolean;
  startInTrayEnabled: boolean;
  autoHideMenuEnabled: boolean;
  seenMinimizeToTrayWarning: boolean;
  seenResetSettingsWarning: boolean;
  savedWindowSize: WindowSize;
  savedWindowPosition: WindowPosition | null;
}

// wraps json settings in the setting type for export
type Settings = {
  [P in keyof JsonSettings]: Setting<JsonSettings[P]>;
};

type WindowSize = {
  width: number;
  height: number;
};

type WindowPosition = {
  x: number;
  y: number;
};

// default settings for the app
const defaultSettings: JsonSettings = {
  trayEnabled: false,
  notificationSoundEnabled: false,
  hideNotificationContentEnabled: false,
  respectSystemDarkModeEnabled: true,
  startInTrayEnabled: false,
  autoHideMenuEnabled: false,
  seenMinimizeToTrayWarning: false,
  seenResetSettingsWarning: false,
  savedWindowSize: { width: 1100, height: 800 },
  savedWindowPosition: null,
};

// create default settings file if it doesnt exist
if (!jetpack.exists(SETTINGS_FILE())) {
  jetpack.write(SETTINGS_FILE(), defaultSettings);
}

// temporary settings object during creation
const settingsToExport: any = {};

// loop through and create all the settings
for (const name in defaultSettings) {
  const key = name as keyof Settings;
  const setting = createSetting(name, defaultSettings[key]);
  settingsToExport[key] = setting;
}

// We know this is safe because we are enumerating all of the settings in default settings
// furthermore the `Settings` type is derived from the default settings type
export const settings: Settings = settingsToExport as Settings;

// loop through and add all the event listeners
// has to be done in this step because settings needs to exist
for (const name in defaultSettings) {
  const key = name as keyof Settings;
  const setting = settings[key];
  setting.subscribe(() => {
    // create a settings object unwrapped from the subjects
    const seriazableSettings: Record<string, validJson> = {};
    Object.entries(settings).forEach(([name, setting]) => {
      seriazableSettings[name] = setting.value;
    });
    // write all the settings to the file from memory to avoid weird read write race conditions
    jetpack.write(SETTINGS_FILE(), seriazableSettings);
  });
}
