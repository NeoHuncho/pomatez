import { Collapse, Radio, Toggler } from "components";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import React, { useCallback } from "react";
import { setNotificationSounds, setNotificationType } from "store";

import {
  NotificationSounds,
  NotificationTypes,
} from "store/settings/types";
import {
  StyledNotificationsSectionContainer,
  StyledNotificationsSoundsCheckboxesContainer,
} from "styles";
import SettingSection from "./SettingSection";

const NotificationSection: React.FC = () => {
  const settings = useAppSelector((state) => state.settings);

  const dispatch = useAppDispatch();

  const onChangeNotificationSound = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(
        setNotificationSounds(e.target.value as NotificationSounds)
      );
    },
    [dispatch]
  );

  return (
    <SettingSection heading="Notifications">
      <Toggler
        id="notification-sound"
        label="Activate Notification Sounds"
        checked={settings.notificationType === NotificationTypes.NORMAL}
        onChange={() => {
          dispatch(
            setNotificationType(
              settings.notificationType === "normal"
                ? NotificationTypes.NONE
                : NotificationTypes.NORMAL
            )
          );
        }}
      />
      <Collapse
        title="Notification Sounds"
        heightResponsive={true}
        disabled={settings.notificationType === NotificationTypes.NONE}
      >
        <StyledNotificationsSectionContainer>
          <StyledNotificationsSoundsCheckboxesContainer>
            <Radio
              id="single"
              label="single"
              name="notificationSound"
              value={NotificationSounds.DEFAULT}
              checked={
                settings.notificationSounds ===
                NotificationSounds.DEFAULT
              }
              onChange={onChangeNotificationSound}
            />
            <Radio
              id="multiple"
              label="multiple"
              name="notificationSound"
              value={NotificationSounds.MULTI}
              checked={
                settings.notificationSounds === NotificationSounds.MULTI
              }
              onChange={onChangeNotificationSound}
            />
            <Radio
              id="custom"
              label="custom"
              name="notificationSound"
              value={NotificationSounds.CUSTOM}
              checked={
                settings.notificationSounds ===
                NotificationSounds.CUSTOM
              }
              onChange={onChangeNotificationSound}
            />
          </StyledNotificationsSoundsCheckboxesContainer>
        </StyledNotificationsSectionContainer>
      </Collapse>
    </SettingSection>
  );
};

export default NotificationSection;
