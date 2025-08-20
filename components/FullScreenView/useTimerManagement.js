import { useEffect, useState, useRef, useCallback, useMemo } from "react";

const useTimerManagement = (assignments, globalTimer3, globalTimers, isAllPlaying, videoRefs) => {
  const [timerStates, setTimerStates] = useState({
    global: { timeLeft: globalTimer3 || 2700, active: false },
    timer1: {
      timeLeft: globalTimers?.timer1 || 60,
      active: false,
      inDelay: false,
      delayTimeLeft: globalTimers?.delay1 || 30,
      shouldRestart: false
    },
    timer2: { timeLeft: globalTimers?.timer2 || 60, active: false, shouldRestart: false }
  });

  const timerRefs = useRef({ global: null, timer1: null, timer2: null });

  const getTimerValues = useCallback(() => {
    const timer1Assignment = assignments.find(
      (assignment, index) => index !== 1 && assignment?.timerDuration
    );
    const timer2Assignment = assignments[1];

    return {
      timer1: {
        duration: timer1Assignment?.timerDuration || globalTimers?.timer1 || 60,
        delay: timer1Assignment?.delayDuration || globalTimers?.delay1 || 30,
        delayText:
          timer1Assignment?.delayText || globalTimers?.delayText1 || "Move to the next station"
      },
      timer2: {
        duration: timer2Assignment?.timerDuration || globalTimers?.timer2 || 60,
        delay: 0,
        delayText: "Restarting Video"
      }
    };
  }, [assignments, globalTimers]);

  const timerValues = useMemo(() => getTimerValues(), [getTimerValues]);

  useEffect(() => {
    setTimerStates((prev) => ({
      ...prev,
      timer1: {
        ...prev.timer1,
        timeLeft: prev.timer1.active ? prev.timer1.timeLeft : timerValues.timer1.duration,
        delayTimeLeft: prev.timer1.inDelay ? prev.timer1.delayTimeLeft : timerValues.timer1.delay
      },
      timer2: {
        ...prev.timer2,
        timeLeft: prev.timer2.active ? prev.timer2.timeLeft : timerValues.timer2.duration
      }
    }));
  }, [timerValues.timer1.duration, timerValues.timer1.delay, timerValues.timer2.duration]);

  const startAllTimers = useCallback(() => {
    setTimerStates((prev) => ({
      ...prev,
      global: { ...prev.global, active: true },
      timer1: { ...prev.timer1, active: true, inDelay: false },
      timer2: { ...prev.timer2, active: true }
    }));
  }, []);

  const stopAllTimers = useCallback(() => {
    Object.values(timerRefs.current).forEach((ref) => ref && clearInterval(ref));
    timerRefs.current = { global: null, timer1: null, timer2: null };

    setTimerStates((prev) => ({
      ...prev,
      global: { ...prev.global, active: false },
      timer1: {
        ...prev.timer1,
        active: false,
        inDelay: false,
        delayTimeLeft: prev.timer1.delayTimeLeft
      },
      timer2: { ...prev.timer2, active: false }
    }));
  }, []);

  // Global timer
  useEffect(() => {
    if (!timerStates.global.active || !isAllPlaying) {
      clearInterval(timerRefs.current.global);
      timerRefs.current.global = null;
      return;
    }

    if (timerRefs.current.global) return;

    timerRefs.current.global = setInterval(() => {
      setTimerStates((prev) => {
        if (prev.global.timeLeft <= 1) {
          videoRefs.current.forEach((ref) => ref?.pause?.());
          clearInterval(timerRefs.current.global);
          timerRefs.current.global = null;
          return {
            global: { timeLeft: 0, active: false },
            timer1: {
              ...prev.timer1,
              active: false,
              inDelay: false,
              timeLeft: 0,
              delayTimeLeft: 0
            },
            timer2: { ...prev.timer2, active: false, timeLeft: 0 }
          };
        }
        return { ...prev, global: { ...prev.global, timeLeft: prev.global.timeLeft - 1 } };
      });
    }, 1000);

    return () => clearInterval(timerRefs.current.global);
  }, [timerStates.global.active, isAllPlaying, videoRefs]);

  // Timer1 (handles both active countdown and delay mode)
  useEffect(() => {
    if (!isAllPlaying || (!timerStates.timer1.active && !timerStates.timer1.inDelay)) {
      clearInterval(timerRefs.current.timer1);
      timerRefs.current.timer1 = null;
      return;
    }

    clearInterval(timerRefs.current.timer1);

    timerRefs.current.timer1 = setInterval(() => {
      setTimerStates((prev) => {
        if (prev.timer1.inDelay) {
          if (prev.timer1.delayTimeLeft <= 1) {
            videoRefs.current.forEach((ref, index) => {
              if (ref && assignments[index] && index !== 1 && ref.restart) ref.restart();
            });
            return {
              ...prev,
              timer1: {
                active: true,
                inDelay: false,
                shouldRestart: true,
                timeLeft: timerValues.timer1.duration,
                delayTimeLeft: timerValues.timer1.delay
              }
            };
          }
          return {
            ...prev,
            timer1: {
              ...prev.timer1,
              delayTimeLeft: prev.timer1.delayTimeLeft - 1
            }
          };
        } else {
          if (prev.timer1.timeLeft <= 1) {
            return {
              ...prev,
              timer1: {
                ...prev.timer1,
                timeLeft: 0,
                active: false,
                inDelay: true,
                delayTimeLeft: timerValues.timer1.delay
              }
            };
          }
          return {
            ...prev,
            timer1: { ...prev.timer1, timeLeft: prev.timer1.timeLeft - 1 }
          };
        }
      });
    }, 1000);

    return () => clearInterval(timerRefs.current.timer1);
  }, [
    videoRefs,
    assignments,
    isAllPlaying,
    timerValues.timer1.delay,
    timerStates.timer1.active,
    timerStates.timer1.inDelay,
    timerValues.timer1.duration
  ]);

  // Timer2
  useEffect(() => {
    if (!timerStates.timer2.active || !isAllPlaying) {
      clearInterval(timerRefs.current.timer2);
      timerRefs.current.timer2 = null;
      return;
    }

    if (timerRefs.current.timer2) return;

    timerRefs.current.timer2 = setInterval(() => {
      setTimerStates((prev) => {
        if (prev.timer2.timeLeft <= 1) {
          if (videoRefs.current[1] && assignments[1] && videoRefs.current[1].restart) {
            videoRefs.current[1].restart();
          }
          return {
            ...prev,
            timer2: { timeLeft: timerValues.timer2.duration, active: true, shouldRestart: true }
          };
        }
        return { ...prev, timer2: { ...prev.timer2, timeLeft: prev.timer2.timeLeft - 1 } };
      });
    }, 1000);

    return () => clearInterval(timerRefs.current.timer2);
  }, [
    timerStates.timer2.active,
    isAllPlaying,
    timerValues.timer2.duration,
    assignments,
    videoRefs
  ]);

  useEffect(() => {
    if (timerStates.timer1.shouldRestart) {
      setTimeout(() => {
        setTimerStates((prev) => ({ ...prev, timer1: { ...prev.timer1, shouldRestart: false } }));
      }, 100);
    }
  }, [timerStates.timer1.shouldRestart]);

  useEffect(() => {
    if (timerStates.timer2.shouldRestart) {
      setTimeout(() => {
        setTimerStates((prev) => ({ ...prev, timer2: { ...prev.timer2, shouldRestart: false } }));
      }, 100);
    }
  }, [timerStates.timer2.shouldRestart]);

  useEffect(() => stopAllTimers, [stopAllTimers]);

  return { timerStates, timerValues, startAllTimers, stopAllTimers, setTimerStates };
};

export default useTimerManagement;
