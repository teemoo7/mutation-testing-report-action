const mockContext = {
  repo: {
    owner: 'the-owner',
    repo: 'the-repo',
  },
  sha: 'the-commit-hash',
};
const checkName = 'Mutation testing';

jest.mock('@actions/github', () => ({
  context: mockContext,
  getOctokit: jest.fn(),
}));

const {
  createCheck,
  logResult,
  reportMutationTesting,
  getHeadSha,
  generateResultSummary,
} = require('./reporter');
const core = require('@actions/core');
const github = require('@actions/github');

const coreInfoSpy = jest.spyOn(core, 'info');
const coreSetOutputSpy = jest.spyOn(core, 'setOutput');

describe('reportMutationTesting', () => {
  test('Report summary in logs and create check for success', () => {
    // given
    const result = {
      count: 13,
      killed: 8,
      survived: 4,
      noCoverage: 1,
      testStrength: 75,
      threshold: 60,
      pass: true,
    };
    const maxAnnotations = 10;

    const checkId = '007';
    const mockOctokit = {
      rest: {
        checks: {
          create: jest.fn().mockResolvedValue({ data: { id: checkId } }),
        },
      },
    };
    github.getOctokit.mockReturnValue(mockOctokit);

    // when
    reportMutationTesting(result, maxAnnotations);

    // then
    expect(coreInfoSpy).toBeCalled();
    expect(coreSetOutputSpy).toBeCalledWith('test-strength', 75);
    expect(coreSetOutputSpy).toBeCalledWith('result', 'success');
    expect(mockOctokit.rest.checks.create).toHaveBeenCalled();
  });

  test('Report summary in logs and create check for failure', () => {
    // given
    const result = {
      count: 13,
      killed: 8,
      survived: 4,
      noCoverage: 1,
      testStrength: 75,
      threshold: 90,
      pass: false,
    };
    const maxAnnotations = 10;

    const checkId = '007';
    const mockOctokit = {
      rest: {
        checks: {
          create: jest.fn().mockResolvedValue({ data: { id: checkId } }),
        },
      },
    };
    github.getOctokit.mockReturnValue(mockOctokit);

    // when
    reportMutationTesting(result, maxAnnotations);

    // then
    expect(coreInfoSpy).toBeCalled();
    expect(coreSetOutputSpy).toBeCalledWith('test-strength', 75);
    expect(coreSetOutputSpy).toBeCalledWith('result', 'failure');
    expect(mockOctokit.rest.checks.create).toHaveBeenCalled();
  });
});

describe('logResult', () => {
  test('Results are logged', () => {
    // given
    const result = {
      count: 13,
      killed: 8,
      survived: 4,
      noCoverage: 1,
      testStrength: 75,
      threshold: 70,
      pass: true,
    };

    // when
    logResult(result);

    // then
    expect(coreInfoSpy).toBeCalled();
  });
});

describe('generateResultSummary', () => {
  test('Results are given as string', () => {
    // given
    const result = {
      count: 13,
      killed: 8,
      survived: 4,
      noCoverage: 1,
      testStrength: 75,
      threshold: 70,
      pass: true,
    };

    // when
    const str = generateResultSummary(result, false);

    // then
    expect(str).toMatch(/^Mutations summary/);
  });

  test('Results are given as markdown', () => {
    // given
    const result = {
      count: 13,
      killed: 8,
      survived: 4,
      noCoverage: 1,
      testStrength: 75,
      threshold: 70,
      pass: true,
    };

    // when
    const str = generateResultSummary(result, true);

    // then
    expect(str).toMatch(/^## Mutations summary/);
  });
});

describe('createCheck', () => {
  test('Check created for failure', async () => {
    // given
    const checkId = '007';
    const mockOctokit = {
      rest: {
        checks: {
          create: jest.fn().mockResolvedValue({ data: { id: checkId } }),
        },
      },
    };
    github.getOctokit.mockReturnValue(mockOctokit);

    const result = {
      count: 13,
      killed: 8,
      survived: 4,
      noCoverage: 1,
      testStrength: 75,
      threshold: 100,
      pass: false,
      mutations: [
        {
          sourceFile: 'Service2.java',
          mutatedClass: 'com.test.Service2',
          mutatedMethod: 'accept',
          lineNumber: 24,
          description:
            'replaced return value with null for com/test/Service2::accept',
          detected: false,
          status: 'NO_COVERAGE',
        },
      ],
    };
    const conclusion = 'failure';
    const maxAnnotations = 1;

    // when
    await createCheck(result, maxAnnotations);

    // then
    expect(mockOctokit.rest.checks.create).toHaveBeenCalledWith({
      owner: mockContext.repo.owner,
      repo: mockContext.repo.repo,
      name: checkName,
      head_sha: mockContext.sha,
      status: 'completed',
      conclusion: conclusion,
      output: expect.anything(),
    });
    expect(coreInfoSpy).toBeCalledWith(
      `Check ${checkId} successfully created with conclusion ${conclusion}`
    );
  });

  test('Check created for success', async () => {
    // given
    const checkId = '007';
    const mockOctokit = {
      rest: {
        checks: {
          create: jest.fn().mockResolvedValue({ data: { id: checkId } }),
        },
      },
    };
    github.getOctokit.mockReturnValue(mockOctokit);

    const result = {
      count: 13,
      killed: 8,
      survived: 4,
      noCoverage: 1,
      testStrength: 75,
      threshold: 70,
      pass: true,
    };
    const conclusion = 'success';
    const maxAnnotations = 0;

    // when
    await createCheck(result, maxAnnotations);

    // then
    expect(mockOctokit.rest.checks.create).toHaveBeenCalledWith({
      owner: mockContext.repo.owner,
      repo: mockContext.repo.repo,
      name: checkName,
      head_sha: mockContext.sha,
      status: 'completed',
      conclusion: conclusion,
      output: expect.anything(),
    });
    expect(coreInfoSpy).toBeCalledWith(
      `Check ${checkId} successfully created with conclusion ${conclusion}`
    );
  });

  test('Check creation error', async () => {
    // given
    const errorMessage = 'Async error';
    const mockOctokit = {
      rest: {
        checks: {
          create: jest.fn().mockRejectedValue(new Error(errorMessage)),
        },
      },
    };
    github.getOctokit.mockReturnValue(mockOctokit);

    const result = {
      count: 13,
      killed: 8,
      survived: 4,
      noCoverage: 1,
      testStrength: 75,
      threshold: 70,
      pass: true,
    };
    const coreSetFailedSpy = jest.spyOn(core, 'setFailed');
    const maxAnnotations = 10;

    // when
    await createCheck(result, maxAnnotations);

    // then
    expect(coreSetFailedSpy).toBeCalledWith(
      `Error creating check: ${errorMessage}`
    );
  });
});

describe('getHeadSha', () => {
  test('Use pull request head sha', () => {
    // given
    const context = {
      eventName: 'pull_request',
      payload: {
        pull_request: {
          head: {
            sha: 'blablabla',
          },
        },
      },
    };

    // when
    const sha = getHeadSha(context);

    // then
    expect(sha).toBe(context.payload.pull_request.head.sha);
  });

  test('Use workflow run head sha', () => {
    // given
    const context = {
      eventName: 'workflow_run',
      payload: {
        workflow_run: {
          head_sha: 'blablabla',
        },
      },
    };

    // when
    const sha = getHeadSha(context);

    // then
    expect(sha).toBe(context.payload.workflow_run.head_sha);
  });

  test('Use default head sha', () => {
    // given
    const context = {
      eventName: 'push',
      sha: 'blablabla',
    };

    // when
    const sha = getHeadSha(context);

    // then
    expect(sha).toBe(context.sha);
  });
});
