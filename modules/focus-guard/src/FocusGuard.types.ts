export type FocusGuardStatus = {
  serviceEnabled: boolean;
  ignoringBatteryOptimizations: boolean;
};

export type LaunchableApp = { packageName: string; label: string };
