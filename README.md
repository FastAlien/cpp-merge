# cpp-merge

Tool to produce a single source file from multiple C/C++ files. It was developed mainly to be used in programming
contests that require submitting a solution as a single source file.

## Install

#### Prerequisites

* node
* npm
* yarn (optional)

#### Installation from npm

```
npm install -g cpp-merge
```

#### Installation from source

##### Clone git repository

```
git clone git@github.com:RandomVoid/cpp-merge.git
```

##### Build and link package

Using npm:

```
npm install
npm run build
npm link
```

Or using yarn:

```
yarn
yarn build
yarn link
```

## Usage

This tool will produce a single source file from multiple C/C++ files. By default produced content is displayed on the
standard output. To save it into a file use option `-o` or `--output`.

File passed as an argument will be processed similarly to what the preprocessor would do. It means all included local
files (ex. `#include "header.hpp"`) will be processed and added to output in place of the include directive. Program
will search for include files first in the directory where the currently processed file is located and then in
additional include directory, if it was specified in program arguments (option `-i` or `--include`).

Files containing `#pragma once` will be processed only once, so use this directive to avoid duplication of content of
files in the output and to reduce its size.

After processing all included files, the program will try to find related source files for each of included local header
files. If a file with the same base name and extension .c or .cpp exists, it will be appended to the output. Program
will search first in the same directory where the main source file is located and then in an additional source
directory, if it was specified in program arguments (option `-s` or `--source`). If the header was included using
relative path ex. `#include "one/two/three.hpp"` the program will search for `three.c` or `three.cpp` in `one/two/`
or `${sourceDirectory}/one/two/`. First found file will be appended to the output.

Program will detect duplication of system header includes, so output will contain only a unique set of them, ordered
alphabetically. Any of the processed header and source files will not be changed.

Display the build-in help:

```
cpp-merge --help
```

#### Usage examples

Process `main.cpp` and display produced content on the standard output:

```
cpp-merge main.cpp
```

Process `main.cpp` and save output to file `output.cpp`:

```
cpp-merge --output output.cpp main.cpp
```

Specify additional include and source directory:

```
cpp-merge --include ../include --source ../src main.cpp
```
