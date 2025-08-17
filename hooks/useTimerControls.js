export const useTimerControls = (globalTimers, setGlobalTimers, assignments, setAssignments) => {
  const handleGlobalTimer1Change = (value) => {
    const timer1Value = parseInt(value || "60");
    setGlobalTimers((prev) => ({ ...prev, timer1: timer1Value }));

    const updated = [...assignments];
    updated.forEach((assignment, index) => {
      if (index !== 1 && assignment) {
        assignment.timerDuration = timer1Value;
      }
    });
    setAssignments(updated);
  };

  const handleGlobalTimer2Change = (value) => {
    const timer2Value = parseInt(value || "60");
    setGlobalTimers((prev) => ({ ...prev, timer2: timer2Value }));

    const updated = [...assignments];
    if (updated[1]) {
      updated[1].delayDuration = 0;
      updated[1].timerDuration = timer2Value;
    }
    setAssignments(updated);
  };

  const handleGlobalTimer3Change = (value) => {
    const timer3Value = parseInt(value || "2700");
    setGlobalTimers((prev) => ({ ...prev, timer3: timer3Value }));
  };

  const handleGlobalTimer4Change = (value) => {
    const timer4Value = parseInt(value || "120");
    setGlobalTimers((prev) => ({ ...prev, timer4: timer4Value }));
  };

  const handleDelay1Change = (value) => {
    const delay1Value = parseInt(value || "30");
    setGlobalTimers((prev) => ({ ...prev, delay1: delay1Value }));

    const updated = [...assignments];
    updated.forEach((assignment, index) => {
      if (index !== 1 && assignment) {
        assignment.delayDuration = delay1Value;
      }
    });
    setAssignments(updated);
  };

  const handleDelayText1Change = (value) => {
    const delayText1Value = value || "Move to the next station";
    setGlobalTimers((prev) => ({ ...prev, delayText1: delayText1Value }));

    const updated = [...assignments];
    updated.forEach((assignment, index) => {
      if (index !== 1 && assignment) {
        assignment.delayText = delayText1Value;
      }
    });
    setAssignments(updated);
  };

  return {
    handleGlobalTimer1Change,
    handleGlobalTimer2Change,
    handleGlobalTimer3Change,
    handleGlobalTimer4Change,
    handleDelay1Change,
    handleDelayText1Change
  };
};
