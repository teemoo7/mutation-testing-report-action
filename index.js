const core = require('@actions/core');
const xmlParser = require('./xmlParser');
const computation = require('./computation');
const reporter = require('./reporter');

async function run() {
  const xmlReportPath = core.getInput('xml-report-path');
  const threshold = parseInt(core.getInput('threshold'));
  const failWorkflow = /true/i.test(core.getInput('fail-workflow'));
  const maxAnnotations = parseInt(core.getInput('max-annotations'));
  if (threshold < 0 || threshold > 100) {
    core.setFailed(
      `Threshold must be a number between 0 and 100. Invalid value: ${threshold}`
    );
  }
  if (maxAnnotations < 0 || maxAnnotations > 50) {
    core.setFailed(
      `GitHub API does not allow to create more than 50 annotations. Invalid value: ${maxAnnotations}`
    );
  }

  const mutations = xmlParser.readFile(xmlReportPath);
  const result = computation.computeResult(mutations, threshold);
  await reporter.reportMutationTesting(result, maxAnnotations);
  if (failWorkflow && result.pass === false) {
    core.setFailed(
      `Test strength is not good enough: ${result.testStrength}% (required was ${result.threshold}%)`
    );
  }
}

run().catch((error) => core.setFailed(error.message));

module.exports = {
  run,
};
