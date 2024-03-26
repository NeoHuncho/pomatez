import { useNotification } from "hooks";
import React, { useCallback, useEffect, useState } from "react";
import { setPlay, setRound, setTimerType } from "store";
import useStayAwake from "use-stay-awake";
import { isEqualToOne, padNum } from "utils";

import notificationIcon from "assets/logos/notification-dark.png";

import breakFinishedAssistanceWav from "assets/audios/voiceAssistance/break-finished.wav";
import focusFinishedAssistanceWav from "assets/audios/voiceAssistance/focus-finished.wav";
import sessionCompletedAssistanceWav from "assets/audios/voiceAssistance/session-completed.wav";
import sixtySecondsLeftAssistanceWav from "assets/audios/voiceAssistance/sixty-seconds-left.wav";
import specialBreakStartedAssistanceWav from "assets/audios/voiceAssistance/special-break-started.wav";
import thirtySecondsLeftAssistanceWav from "assets/audios/voiceAssistance/thirty-seconds-left.wav";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import { TimerStatus } from "store/timer/types";

// import focusFinishedMp3 from "assets/audios/focus-finished.mp3";
// import longBreakFinishedMp3 from "assets/audios/long-break-finished.mp3";
// import sessionFinishedMp3 from "assets/audios/session-finished.mp3";
// import shortBreakFinishedMp3 from "assets/audios/short-break-finished.mp3";
// import sixtySecondsLeftBreakMp3 from "assets/audios/sixty-seconds-left-break.mp3";
import threeMinsLeftFocusMp3 from "assets/audios/three-mins-left-focus.mp3";

type CounterProps = {
  count: number;
  duration: number;
  timerType?: TimerStatus;
  resetTimerAction?: () => void;
  shouldFullscreen?: boolean;
};

const CounterContext = React.createContext<CounterProps>({
  count: 0,
  duration: 0,
});

const CounterProvider: React.FC = ({ children }) => {
  const dispatch = useAppDispatch();

  const { timer, config } = useAppSelector((state) => ({
    timer: state.timer,
    config: state.config,
  }));

  const settings = useAppSelector((state) => state.settings);

  const { preventSleeping, allowSleeping } = useStayAwake();

  const notification = useNotification(
    {
      icon: notificationIcon,
      mute: !settings.notificationSoundOn,
      notificationSounds: settings.notificationSounds,
    },
    settings.notificationType !== "none"
  );

  const [shouldFullscreen, setShouldFullscreen] = useState(false);

  const [count, setCount] = useState(config.stayFocus * 60);

  const [duration, setDuration] = useState(config.stayFocus * 60);

  const setTimerDuration = useCallback((time: number) => {
    setDuration(time * 60);

    setCount(time * 60);
  }, []);

  const resetTimerAction = useCallback(() => {
    switch (timer.timerType) {
      case TimerStatus.STAY_FOCUS:
        setTimerDuration(config.stayFocus);
        break;
      case TimerStatus.SHORT_BREAK:
        setTimerDuration(config.shortBreak);
        break;
      case TimerStatus.LONG_BREAK:
        setTimerDuration(config.longBreak);
        break;
      case TimerStatus.SPECIAL_BREAK:
        setDuration(duration);
        setCount(duration);
        break;
    }
  }, [
    config.longBreak,
    config.stayFocus,
    config.shortBreak,
    timer.timerType,
    duration,
    setDuration,
    setTimerDuration,
  ]);

  useEffect(() => {
    if (timer.playing && timer.timerType !== TimerStatus.STAY_FOCUS) {
      preventSleeping();
    } else {
      allowSleeping();
    }
  }, [timer.playing, timer.timerType, preventSleeping, allowSleeping]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const { firstBreak, secondBreak, thirdBreak, fourthBreak } =
      config.specialBreaks;

    if (timer.playing) {
      interval = setInterval(() => {
        const date = new Date();
        const currentTime =
          padNum(date.getHours()) + ":" + padNum(date.getMinutes());

        if (timer.timerType !== TimerStatus.SPECIAL_BREAK) {
          const breaks = [
            firstBreak,
            secondBreak,
            thirdBreak,
            fourthBreak,
          ];

          for (const breakTime of breaks) {
            if (breakTime && currentTime === breakTime.fromTime) {
              dispatch(setTimerType(TimerStatus.SPECIAL_BREAK));
              setTimerDuration(breakTime.duration);
              notification(
                "Special break started.",
                {
                  body: `Enjoy your ${breakTime.duration} ${
                    isEqualToOne(breakTime.duration)
                      ? "minute"
                      : "minutes"
                  } special break.`,
                },
                specialBreakStartedAssistanceWav
              );
              return;
            }
          }
        } else {
          return clearInterval(interval);
        }
      }, 500);
    }

    return () => clearInterval(interval);
  }, [
    config.specialBreaks,
    timer.timerType,
    timer.playing,
    dispatch,
    notification,
    setTimerDuration,
  ]);

  useEffect(() => {
    switch (timer.timerType) {
      case TimerStatus.STAY_FOCUS:
        setTimerDuration(config.stayFocus);
        break;
      case TimerStatus.SHORT_BREAK:
        setTimerDuration(config.shortBreak);
        break;
      case TimerStatus.LONG_BREAK:
        setTimerDuration(config.longBreak);
        break;
    }
  }, [
    setTimerDuration,
    timer.timerType,
    config.stayFocus,
    config.shortBreak,
    config.longBreak,
  ]);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout;

    if (timer.playing) {
      timerInterval = setInterval(() => {
        setCount((prevState) => {
          let remaining = prevState - 1;
          return remaining;
        });
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [timer.playing]);

  useEffect(() => {
    const timerMessages = {
      [TimerStatus.SHORT_BREAK]:
        "Prepare yourself to stay focused again.",
      [TimerStatus.LONG_BREAK]:
        "Prepare yourself to stay focused again.",
      [TimerStatus.SPECIAL_BREAK]:
        "Prepare yourself to stay focused again.",
      [TimerStatus.STAY_FOCUS]:
        "Pause all media playing if there's one.",
    };

    const timerEndMessages = {
      [TimerStatus.STAY_FOCUS]: {
        message: "Focus time finished.",
        nextType: TimerStatus.SHORT_BREAK,
        sound: focusFinishedAssistanceWav,
      },
      [TimerStatus.SHORT_BREAK]: {
        message: "Break time finished.",
        nextType: TimerStatus.STAY_FOCUS,
        sound: breakFinishedAssistanceWav,
      },
      [TimerStatus.LONG_BREAK]: {
        message: "Break time finished.",
        nextType: TimerStatus.STAY_FOCUS,
        sound: breakFinishedAssistanceWav,
      },
      [TimerStatus.SPECIAL_BREAK]: {
        message: "Break time finished.",
        nextType: TimerStatus.STAY_FOCUS,
        sound: sessionCompletedAssistanceWav,
      },
    };
    if (settings.notificationType === "extra") {
      if (count === 61) {
        notification(
          "60 seconds left.",
          { body: timerMessages[timer.timerType] },
          settings.enableVoiceAssistance &&
            sixtySecondsLeftAssistanceWav
        );
      } else if (
        count === 60 &&
        timer.timerType === TimerStatus.STAY_FOCUS
      ) {
        notification(
          "60 seconds left.",
          { body: "Pause all media playing if there's one." },
          settings.enableVoiceAssistance
            ? thirtySecondsLeftAssistanceWav
            : threeMinsLeftFocusMp3
        );
      }
    }

    if (count === 0) {
      const timerEndMessage = timerEndMessages[timer.timerType];
      if (timerEndMessage) {
        setTimeout(() => {
          notification(
            timerEndMessage.message,
            {
              body: `Enjoy your ${config[timerEndMessage.nextType]} ${
                isEqualToOne(config[timerEndMessage.nextType])
                  ? "minute"
                  : "minutes"
              } ${timerEndMessage.nextType.replace("_", " ")}.`,
            },
            settings.enableVoiceAssistance && timerEndMessage.sound
          );

          dispatch(setTimerType(timerEndMessage.nextType));

          if (timerEndMessage.nextType === TimerStatus.STAY_FOCUS) {
            dispatch(
              setRound(
                timer.timerType === TimerStatus.SHORT_BREAK
                  ? timer.round + 1
                  : 1
              )
            );
            if (!settings.autoStartWorkTime) {
              dispatch(setPlay(false));
            }
          }
        }, 1000);
      }
    }
  }, [
    count,
    timer.round,
    timer.playing,
    timer.timerType,
    dispatch,
    notification,
    config.stayFocus,
    config.shortBreak,
    config.longBreak,
    config.sessionRounds,
    settings.notificationType,
    settings.autoStartWorkTime,
    settings.enableVoiceAssistance,
    config,
  ]);

  useEffect(() => {
    if (settings.enableFullscreenBreak) {
      if (timer.timerType !== TimerStatus.STAY_FOCUS) {
        setShouldFullscreen(true);
      } else {
        setShouldFullscreen(false);
      }
    }
  }, [settings.enableFullscreenBreak, timer.timerType]);

  return (
    <CounterContext.Provider
      value={{
        count,
        duration,
        resetTimerAction,
        shouldFullscreen,
        timerType: timer.timerType,
      }}
    >
      {children}
    </CounterContext.Provider>
  );
};

export { CounterContext, CounterProvider };
