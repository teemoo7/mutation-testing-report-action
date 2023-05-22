const fs = require('fs');
const xmlParser = require('./xmlParser');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mutations>
<mutation detected='true' status='KILLED' numberOfTestsRun='3'><sourceFile>MoveService.java</sourceFile><mutatedClass>ch.teemoo.bobby.services.MoveService</mutatedClass><mutatedMethod>canMove</mutatedMethod><methodDescription>(Lch/teemoo/bobby/models/Board;Lch/teemoo/bobby/models/Color;Ljava/util/List;)Z</methodDescription><lineNumber>377</lineNumber><mutator>org.pitest.mutationtest.engine.gregor.mutators.returns.BooleanTrueReturnValsMutator</mutator><indexes><index>24</index></indexes><blocks><block>5</block></blocks><killingTest>ch.teemoo.bobby.services.MoveServiceTest.testGetGameStateDrawStalemate(ch.teemoo.bobby.services.MoveServiceTest)</killingTest><description>replaced boolean return with true for ch/teemoo/bobby/services/MoveService::canMove</description></mutation>
<mutation detected='false' status='NO_COVERAGE' numberOfTestsRun='0'><sourceFile>MoveService.java</sourceFile><mutatedClass>ch.teemoo.bobby.services.MoveService</mutatedClass><mutatedMethod>computeMoveAnalysis</mutatedMethod><methodDescription>(Lch/teemoo/bobby/models/Board;Lch/teemoo/bobby/models/Color;Ljava/util/List;ILch/teemoo/bobby/models/Color;Lch/teemoo/bobby/models/Position;Lch/teemoo/bobby/models/Position;Lch/teemoo/bobby/models/moves/Move;Ljava/time/LocalDateTime;)Lch/teemoo/bobby/models/MoveAnalysis;</methodDescription><lineNumber>197</lineNumber><mutator>org.pitest.mutationtest.engine.gregor.mutators.returns.NullReturnValsMutator</mutator><indexes><index>19</index></indexes><blocks><block>5</block></blocks><killingTest/><description>replaced return value with null for ch/teemoo/bobby/services/MoveService::computeMoveAnalysis</description></mutation>
<mutation detected='false' status='SURVIVED' numberOfTestsRun='19'><sourceFile>MoveService.java</sourceFile><mutatedClass>ch.teemoo.bobby.services.MoveService</mutatedClass><mutatedMethod>computePawnMoves</mutatedMethod><methodDescription>(Lch/teemoo/bobby/models/pieces/Piece;IILch/teemoo/bobby/models/Board;Ljava/util/List;Z)Ljava/util/List;</methodDescription><lineNumber>437</lineNumber><mutator>org.pitest.mutationtest.engine.gregor.mutators.MathMutator</mutator><indexes><index>79</index></indexes><blocks><block>12</block></blocks><killingTest/><description>Replaced integer multiplication with division</description></mutation>
<mutation detected='true' status='KILLED' numberOfTestsRun='1'><sourceFile>MoveService.java</sourceFile><mutatedClass>ch.teemoo.bobby.services.MoveService</mutatedClass><mutatedMethod>computePawnMoves</mutatedMethod><methodDescription>(Lch/teemoo/bobby/models/pieces/Piece;IILch/teemoo/bobby/models/Board;Ljava/util/List;Z)Ljava/util/List;</methodDescription><lineNumber>451</lineNumber><mutator>org.pitest.mutationtest.engine.gregor.mutators.MathMutator</mutator><indexes><index>162</index></indexes><blocks><block>30</block></blocks><killingTest>ch.teemoo.bobby.services.MoveServiceTest.testComputePawnMovesEnPassant(ch.teemoo.bobby.services.MoveServiceTest)</killingTest><description>Replaced integer subtraction with addition</description></mutation>
<mutation detected='false' status='SURVIVED' numberOfTestsRun='11'><sourceFile>MoveService.java</sourceFile><mutatedClass>ch.teemoo.bobby.services.MoveService</mutatedClass><mutatedMethod>computePawnMoves</mutatedMethod><methodDescription>(Lch/teemoo/bobby/models/pieces/Piece;IILch/teemoo/bobby/models/Board;Ljava/util/List;Z)Ljava/util/List;</methodDescription><lineNumber>452</lineNumber><mutator>org.pitest.mutationtest.engine.gregor.mutators.MathMutator</mutator><indexes><index>179</index></indexes><blocks><block>35</block></blocks><killingTest/><description>Replaced integer multiplication with division</description></mutation>
</mutations>
`;

describe('readFile', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Read mutations XML file', () => {
    // given
    jest.spyOn(fs, 'readFileSync').mockReturnValue(xml);
    const path = 'mutations.xml';

    // when
    const mutations = xmlParser.readFile(path);

    // then
    expect(fs.readFileSync).toBeCalledWith(path, 'utf8');
    expect(mutations).toBeTruthy();
    expect(mutations.length).toBeGreaterThan(0);
  });

  test('Read empty mutations XML file', () => {
    // given
    jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue('<?xml version="1.0" encoding="UTF-8"?><mutations/>');
    const path = 'mutations.xml';

    // when
    const mutations = xmlParser.readFile(path);

    // then
    expect(fs.readFileSync).toBeCalledWith(path, 'utf8');
    expect(mutations).toBeTruthy();
    expect(mutations.length).toBe(0);
  });

  test('Read mutations XML file without mutations element', () => {
    // given
    jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue('<?xml version="1.0" encoding="UTF-8"?><test></test>');
    const path = 'mutations.xml';

    // when
    const mutations = xmlParser.readFile(path);

    // then
    expect(mutations).toBeTruthy();
    expect(mutations.length).toBe(0);
  });

  test('Read invalid mutations XML file', () => {
    // given
    jest.spyOn(fs, 'readFileSync').mockReturnValue('{"test": true}');
    const path = 'mutations.xml';

    // when
    const runnable = () => xmlParser.readFile(path);

    // then
    expect(runnable).toThrowError("char '{' is not expected.:1:1");
  });

  test('Read non-existing XML file', () => {
    // given
    const path = 'hello.xml';

    // when
    const runnable = () => xmlParser.readFile(path);

    // then
    expect(runnable).toThrowError(
      "ENOENT: no such file or directory, open '" + path + "'"
    );
  });
});
