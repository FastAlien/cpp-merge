# cpp-merge
Tool to produce single source file from multiple C/C++ files.

## Install
#### Prerequisites
* node
* npm
* yarn (optional)

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
This tool will produce single source file from multiple C/C++ files and display produced content on standard output.
File passed as an argument will be processed similarly to what preprocessor would do. It means all included project
files (ex. `#include "header.hpp"`) will processed and added to output in place of corresponding include directive.
Program will search for include files first in directory where currently processed file is located and then it will
try to find them in additional include directory, if it was specified in program arguments (option `-i` or `--include`).

Files containing #pragma once will be processed only once, so use this directive to avoid duplication of content of
files in the output and to reduce its size.

After processing all included files, for each of included local header file program will try to find corresponding
source file. If file with same base name and extension .c or .cpp exists, it will be appended to the output. Program 
will search for the source file first in the same directory where header file is located and then it will search in 
additional source directory, if it was specified in program arguments (option `-s` or `--source`).

Program will detect duplication of system header includes, so output will contain only unique set of them, ordered
alphabetically. Any of processed headers and source files will not be changed.

Process `main.cpp` and display produced content on standard output:
```
cpp-merge main.cpp
```

Process `main.cpp` and redirect output to file `single.cpp`:
```
cpp-merge main.cpp > single.cpp
```

Specify additional include and source directory:
```
cpp-merge --include ../include --source ../src main.cpp
``` 

Display build-in help:
```
cpp-merge --help
```
