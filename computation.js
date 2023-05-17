function computeResult(mutations, threshold) {
  const count = mutations.length;
  const killed = mutations.filter(
    (mutation) => mutation.status === 'KILLED'
  ).length;
  const survived = mutations.filter(
    (mutation) => mutation.status === 'SURVIVED'
  ).length;
  const noCoverage = mutations.filter(
    (mutation) => mutation.status === 'NO_COVERAGE'
  ).length;
  let testStrength;
  if (count - noCoverage === 0) {
    testStrength = 0;
  } else {
    testStrength = Math.round((killed / (count - noCoverage)) * 100);
  }
  const pass = testStrength >= threshold;
  const mutationsDetails = mutations
    .filter((mutation) => mutation.detected === false)
    .map((mutation) => {
      return {
        file: mutation.sourceFile,
        class: mutation.mutatedClass,
        method: mutation.mutatedMethod,
        line: mutation.lineNumber,
        status: mutation.status,
        info: mutation.description,
      };
    });

  return {
    count: count,
    killed: killed,
    survived: survived,
    noCoverage: noCoverage,
    testStrength: testStrength,
    threshold: threshold,
    pass: pass,
    mutations: mutationsDetails,
  };
}

module.exports = {
  computeResult,
};
