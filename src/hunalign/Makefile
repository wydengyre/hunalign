sources = alignerTool.cpp alignment.cpp bloom.cpp bookToMatrix.cpp cooccurrence.cpp cooccurrenceTool.cpp dictionary.cpp main.cpp networkFlow.cpp oldAlignTest.cpp trailPostprocessors.cpp translate.cpp wordAlignment.cpp ../utils/stringsAndStreams.cpp ../utils/argumentsParser.cpp ../utils/timer.cpp

headers = alignment.h bloom.h bookToMatrix.h cooccurrence.h dictionary.h dicTree.h help.h networkFlow.h quasiDiagonal.h similarityEvaluator.h TEIReader.h trailPostprocessors.h translate.h wordAlignment.h words.h

objects = alignerTool.o alignment.o bloom.o bookToMatrix.o cooccurrence.o cooccurrenceTool.o dictionary.o main.o networkFlow.o oldAlignTest.o trailPostprocessors.o translate.o wordAlignment.o ../utils/stringsAndStreams.o ../utils/argumentsParser.o ../utils/timer.o

dir_guard=@mkdir -p $(@D)

SHELL = /bin/bash
CXX = emcc
CPPFLAGS = -O3 -ffast-math -funroll-loops -I ../include
EMFLAGS =\
  -sENVIRONMENT=web,node,worker\
  -sEXPORT_ES6\
  -sMODULARIZE\
  -sUSE_ES6_IMPORT_META\
  -s'EXPORT_NAME="mkHunalign"'\
  -sNO_INVOKE_RUN\
  -sALLOW_MEMORY_GROWTH\
  -sEXPORTED_RUNTIME_METHODS=callMain,FS
LIBS = -lstdc++
RM = rm -f

../../build/hunalign.js ../../build/hunalign.wasm: $(objects)
	$(dir_guard)
	$(CXX) $(CPPFLAGS) $(EMFLAGS) $(LIBS) -o ../../build/hunalign.js $(objects)

depend:
	makedepend -Y -s"# DO NOT DELETE THIS LINE -- hunaligndep" $(sources)

clean:
	$(RM) $(objects) ../../build/*

# DO NOT DELETE THIS LINE -- hunaligndep

alignerTool.o: alignment.h quasiDiagonal.h words.h bookToMatrix.h translate.h
alignerTool.o: dictionary.h cooccurrence.h trailPostprocessors.h help.h
alignment.o: alignment.h quasiDiagonal.h words.h dictionary.h
bloom.o: bloom.h words.h
bookToMatrix.o: bookToMatrix.h words.h alignment.h quasiDiagonal.h
bookToMatrix.o: dictionary.h
cooccurrence.o: cooccurrence.h words.h networkFlow.h dictionary.h translate.h
cooccurrenceTool.o: cooccurrence.h words.h networkFlow.h dictionary.h
dictionary.o: dictionary.h words.h
networkFlow.o: networkFlow.h
oldAlignTest.o: dictionary.h words.h bloom.h translate.h alignment.h
oldAlignTest.o: quasiDiagonal.h bookToMatrix.h dicTree.h
trailPostprocessors.o: trailPostprocessors.h alignment.h quasiDiagonal.h
trailPostprocessors.o: words.h bookToMatrix.h
translate.o: translate.h words.h dictionary.h dicTree.h
wordAlignment.o: wordAlignment.h words.h dictionary.h
