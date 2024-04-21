import { Alert } from "components";
import { useState } from "react";
import { StyledSettings } from "styles";
import { getFromStorage, saveToStorage } from "utils";

import { useAppSelector } from "hooks/storeHooks";
import { Updater } from "../../components";
import FeatureSection from "./FeatureSection";
import HelpSection from "./HelpSection";
import NotificationSection from "./NotificationSection";
import SettingHeader from "./SettingHeader";
import ShortcutSection from "./ShortcutSection";
import StickySection from "./StickySection";

export default function Settings() {
  const alertState = getFromStorage("alert") || null;

  const update = useAppSelector((state) => state.update);

  const [alert, setAlert] = useState(alertState);

  return update.updateBody ? (
    <Updater />
  ) : (
    <StyledSettings>
      <SettingHeader />
      {alert === null && (
        <Alert
          heading="Hi 👋,"
          body="If you liked this app, please consider starring this project on GitHub to show your ❤️ and
				support."
          onClose={() => {
            saveToStorage("alert", "hide");
            setAlert("hide");
          }}
        />
      )}
      <FeatureSection />
      <NotificationSection />
      <ShortcutSection />
      <HelpSection />
      <StickySection />
    </StyledSettings>
  );
}
