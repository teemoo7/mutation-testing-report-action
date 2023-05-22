const { computeResult } = require('./computation');
describe('computeResult', () => {
  test('Compute result failure', () => {
    // given
    const mutations = [
      { status: 'KILLED' },
      { status: 'KILLED' },
      { status: 'KILLED' },
      { status: 'NO_COVERAGE' },
      { status: 'NO_COVERAGE' },
      { status: 'SURVIVED' },
      { status: 'SURVIVED' },
      { status: 'SURVIVED' },
      { status: 'SURVIVED' },
      { status: 'SURVIVED' },
    ];
    const threshold = 80;

    // when
    const result = computeResult(mutations, threshold);

    // then
    expect(result).toBeTruthy();
    expect(result.count).toBe(10);
    expect(result.killed).toBe(3);
    expect(result.survived).toBe(5);
    expect(result.noCoverage).toBe(2);
    expect(result.testStrength).toBe(38);
    expect(result.threshold).toBe(threshold);
    expect(result.pass).toBe(false);
  });

  test('Compute result success', () => {
    // given
    const mutations = [
      { status: 'KILLED' },
      { status: 'KILLED' },
      { status: 'KILLED' },
      { status: 'NO_COVERAGE' },
      { status: 'NO_COVERAGE' },
      { status: 'SURVIVED' },
      { status: 'SURVIVED' },
    ];
    const threshold = 60;

    // when
    const result = computeResult(mutations, threshold);

    // then
    expect(result).toBeTruthy();
    expect(result.count).toBe(7);
    expect(result.killed).toBe(3);
    expect(result.survived).toBe(2);
    expect(result.noCoverage).toBe(2);
    expect(result.testStrength).toBe(60);
    expect(result.threshold).toBe(threshold);
    expect(result.pass).toBe(true);
  });

  test('Compute result empty (failure)', () => {
    // given
    const mutations = [];
    const threshold = 50;

    // when
    const result = computeResult(mutations, threshold);

    // then
    expect(result).toBeTruthy();
    expect(result.count).toBe(0);
    expect(result.killed).toBe(0);
    expect(result.survived).toBe(0);
    expect(result.noCoverage).toBe(0);
    expect(result.testStrength).toBe(0);
    expect(result.threshold).toBe(threshold);
    expect(result.pass).toBe(false);
  });

  test('Compute result with rounding', () => {
    // given
    const mutations = [
      { status: 'KILLED' },
      { status: 'SURVIVED' },
      { status: 'SURVIVED' },
    ];
    const threshold = 80;

    // when
    const result = computeResult(mutations, threshold);

    // then
    expect(result).toBeTruthy();
    expect(result.count).toBe(3);
    expect(result.killed).toBe(1);
    expect(result.survived).toBe(2);
    expect(result.noCoverage).toBe(0);
    expect(result.testStrength).toBe(33);
    expect(result.threshold).toBe(threshold);
    expect(result.pass).toBe(false);
  });

  test('Compute result with mutations details', () => {
    // given
    const mutations = [
      {
        sourceFile: 'Service1.java',
        mutatedClass: 'com.test.Service1',
        mutatedMethod: 'count',
        lineNumber: 17,
        description:
          'replaced boolean return with true for com/test/Service1::count',
        detected: true,
        status: 'KILLED',
      },
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
      {
        sourceFile: 'Service3.java',
        mutatedClass: 'com.test.Service3',
        mutatedMethod: 'apply',
        lineNumber: 33,
        description: 'Replaced integer multiplication with division',
        detected: false,
        status: 'SURVIVED',
      },
    ];
    const threshold = 50;

    // when
    const result = computeResult(mutations, threshold);

    // then
    expect(result).toBeTruthy();
    expect(result.mutations).toHaveLength(2);
    expect(result.mutations).toContainEqual({
      file: 'Service2.java',
      class: 'com.test.Service2',
      method: 'accept',
      line: 24,
      status: 'NO_COVERAGE',
      info: 'replaced return value with null for com/test/Service2::accept',
    });
    expect(result.mutations).toContainEqual({
      file: 'Service3.java',
      class: 'com.test.Service3',
      method: 'apply',
      line: 33,
      status: 'SURVIVED',
      info: 'Replaced integer multiplication with division',
    });
  });
});
