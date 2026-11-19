// Assessment progress is read only from backend course-content data or from
// the successful submit response carried through React Router navigation.
// No browser storage or locally generated progress records are used.

const toPositiveId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const isModuleAssessmentPassed = (module) => (
  module?.assessmentPassed === true ||
  module?.quizPassed === true ||
  module?.assessment?.passed === true ||
  module?.latestAttempt?.passed === true ||
  module?.assessment?.latestAttempt?.passed === true ||
  module?.assessmentProgress?.passed === true
);

export const getPassedModuleIds = (modules = [], navigationPassedIds = []) => {
  const idsFromApi = modules
    .filter(isModuleAssessmentPassed)
    .map((module) => toPositiveId(module.id))
    .filter(Boolean);

  const idsFromSubmitResponse = Array.isArray(navigationPassedIds)
    ? navigationPassedIds.map(toPositiveId).filter(Boolean)
    : [];

  return [...new Set([...idsFromApi, ...idsFromSubmitResponse])];
};

export const getReadModuleIdsFromApi = (modules = []) => modules
  .filter((module) => {
    const status = String(module?.status || module?.completionStatus || "").toLowerCase();
    return module?.completed === true || module?.isCompleted === true || status === "completed";
  })
  .map((module) => toPositiveId(module.id))
  .filter(Boolean);
