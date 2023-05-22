const core = require('@actions/core');
const github = require('@actions/github');

async function reportMutationTesting(result, maxAnnotations) {
  logResult(result);
  core.setOutput('test-strength', result.testStrength);
  core.setOutput('result', result.pass === true ? 'success' : 'failure');
  await createCheck(result, maxAnnotations);
}

function logResult(result) {
  core.info(generateResultSummary(result, false));
}

function generateResultSummary(result, markdown) {
  if (markdown === true) {
    return `## Mutations summary
| Measure       | Value                   |
| :---          |                    ---: |
| Total         | ${result.count}         |
| Killed        | ${result.killed}        |
| Survived      | ${result.survived}      |
| No coverage   | ${result.noCoverage}    |
| Test strength | ${result.testStrength}% |
| Threshold     | ${result.threshold}%    |
| **Pass**      | **${result.pass}**      |`;
  } else {
    return `Mutations summary:
  Total:          ${result.count}
  Killed:         ${result.killed}
  Survived:       ${result.survived}
  No coverage:    ${result.noCoverage}
  Test strength:  ${result.testStrength}%
  Threshold:      ${result.threshold}%
  Pass:           ${result.pass}`;
  }
}

async function createCheck(result, maxAnnotations) {
  const { context } = github;
  const { owner, repo } = context.repo;

  const success = result.pass === true;
  const conclusion = success ? 'success' : 'failure';
  const summary = `Required: ${result.threshold}%, actual: ${result.testStrength}%`;
  const strengthBadgeMarkDown = `![Test strength](https://img.shields.io/badge/Tests_strength-${result.testStrength}%25-lightgrey)`;
  const resultBadgeMarkDown = success
    ? `![Mutation test success](https://img.shields.io/badge/Mutation_test-${conclusion}-brightgreen)`
    : `![Mutation test failure](https://img.shields.io/badge/Mutation_test-${conclusion}-red)`;
  const text = `${strengthBadgeMarkDown} ${resultBadgeMarkDown}
  ---
  ${generateResultSummary(result, true)}`;
  let output;

  if (success) {
    output = {
      title: `Test strength is good`,
      summary: summary,
      text: text,
    };
  } else {
    output = {
      title: `Test strength is too low`,
      summary: summary,
      text: text,
      annotations: Array.isArray(result.mutations)
        ? result.mutations
            .slice(0, maxAnnotations)
            .map((mutation) => generateAnnotation(mutation))
        : [],
    };
  }

  try {
    const octokit = github.getOctokit(core.getInput('token'));
    const params = {
      owner: owner,
      repo: repo,
      name: 'Mutation testing',
      head_sha: getHeadSha(github.context),
      status: 'completed',
      conclusion: conclusion,
      output: output,
    };
    const { data } = await octokit.rest.checks.create(params);
    core.info(
      `Check ${data.id} successfully created with conclusion ${conclusion}`
    );
    core.debug(`All params: ${JSON.stringify(params)}`);
    core.debug(`Response:   ${JSON.stringify(data)}`);
  } catch (error) {
    core.setFailed(`Error creating check: ${error.message}`);
  }
}

function getHeadSha(context) {
  const eventName = context.eventName;
  const payload = context.payload;
  switch (eventName) {
    case 'pull_request':
      return payload.pull_request.head.sha;
    case 'workflow_run':
      return payload.workflow_run.head_sha;
    default:
      return context.sha;
  }
}

function generateAnnotation(mutation) {
  return {
    path: mutation.file,
    start_line: mutation.line,
    end_line: mutation.line,
    annotation_level: 'warning',
    message: `Mutation status: ${mutation.status}
    
  Class:       ${mutation.class}
  Method:      ${mutation.method}
  Description: ${mutation.info}`,
  };
}

module.exports = {
  reportMutationTesting,
  logResult,
  createCheck,
  getHeadSha,
  generateResultSummary,
};
