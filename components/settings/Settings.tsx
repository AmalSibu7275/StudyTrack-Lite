"use client";

import SettingsHeader from "./SettingsHeader";
import SettingsTabs from "./SettingsTabs";
import ProfileCard from "./ProfileCard";
import StudyPreferences from "./StudyPreferences";
import DailyGoals from "./DailyGoals";
import TrackingSettings from "./TrackingSettings";
import NotificationPreferences from "./NotificationPreferences";
import DataStorage from "./DataStorage";
import AccountActions from "./AccountActions";

export default function Settings() {
  return (
    <div className="space-y-6">

      <SettingsHeader />

      <SettingsTabs />

      {/* Top Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        <div className="xl:col-span-4">
          <ProfileCard />
        </div>

        <div className="xl:col-span-4">
          <StudyPreferences />
        </div>

        <div className="xl:col-span-4">
          <DailyGoals />
        </div>

      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        <div className="xl:col-span-4">
          <TrackingSettings />
        </div>

        <div className="xl:col-span-4">
          <NotificationPreferences />
        </div>

        <div className="xl:col-span-4">
          <DataStorage />
        </div>

      </div>

      {/* Bottom */}
      <AccountActions />

    </div>
  );
}