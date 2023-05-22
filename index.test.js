const { run } = require('./index');
const core = require('@actions/core');

jest.mock('./xmlParser', () => ({
  readFile: () => [],
}));

const result = {
  testStrength: 75,
  threshold: 80,
  pass: false,
};

jest.mock('./computation', () => ({
  computeResult: () => result,
}));
jest.mock('./reporter', () => ({
  reportMutationTesting: () => {},
}));

const coreSetFailedSpy = jest.spyOn(core, 'setFailed');

describe('run', () => {
  afterEach(() => {
    delete process.env['INPUT_XML-REPORT-PATH'];
    delete process.env['INPUT_THRESHOLD'];
    delete process.env['INPUT_FAIL-WORKFLOW'];
  });

  test('Call everything with success', async () => {
    // given
    process.env['INPUT_XML-REPORT-PATH'] = './test.xml';
    process.env['INPUT_THRESHOLD'] = '75';
    process.env['INPUT_FAIL-WORKFLOW'] = 'false';
    process.env['INPUT_MAX-ANNOTATIONS'] = '5';

    // when
    await run();

    // then
    expect(coreSetFailedSpy).toBeCalledTimes(0);
  });

  test('Call everything with failure and step set to failed', async () => {
    // given
    process.env['INPUT_XML-REPORT-PATH'] = './test.xml';
    process.env['INPUT_THRESHOLD'] = '75';
    process.env['INPUT_FAIL-WORKFLOW'] = 'true';
    process.env['INPUT_MAX-ANNOTATIONS'] = '5';

    // when
    await run();

    // then
    expect(coreSetFailedSpy).toHaveBeenCalledWith(
      `Test strength is not good enough: ${result.testStrength}% (required was ${result.threshold}%)`
    );
  });

  test('Invalid threshold input', async () => {
    // given
    const threshold = '500';
    process.env['INPUT_XML-REPORT-PATH'] = './test.xml';
    process.env['INPUT_THRESHOLD'] = threshold;
    process.env['INPUT_FAIL-WORKFLOW'] = 'true';
    process.env['INPUT_MAX-ANNOTATIONS'] = '5';

    // when
    await run();

    // then
    expect(coreSetFailedSpy).toHaveBeenCalledWith(
      `Threshold must be a number between 0 and 100. Invalid value: ${threshold}`
    );
  });

  test('Invalid max-annotations input', async () => {
    // given
    const maxAnnotations = '100';
    process.env['INPUT_XML-REPORT-PATH'] = './test.xml';
    process.env['INPUT_THRESHOLD'] = '80';
    process.env['INPUT_FAIL-WORKFLOW'] = 'true';
    process.env['INPUT_MAX-ANNOTATIONS'] = maxAnnotations;

    // when
    await run();

    // then
    expect(coreSetFailedSpy).toHaveBeenCalledWith(
      `GitHub API does not allow to create more than 50 annotations. Invalid value: ${maxAnnotations}`
    );
  });
});
