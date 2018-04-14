# klink
Linq like lib in Typescript that supports javascript iterators 

# Functions

* aggregate()
* all()
* any()
* average()
* concat() 
* count()
* elementAt()
* first()
* firstOrDefault()
* forEach()
* groupBy()
* keyValue()
* last()
* lastOrDefault()
* reverse()
* select()
* selectMany()
* single()
* singleOrDefault()
* skip()
* skipWhile()
* sum()
* take()
* takeWhile() 
* toArray()
* toDictionary()
* where()

# Usage 
```javascript
import {Klink} from 'klink';

let values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
let results = Klink.fromArray(values)
            .where(v => v > 2 && v <= 8)
            .forEach(v => v + 10)
            .groupBy(v => v % 2);
```
# Build 
```sh
$ npm build
```

# Tests
```sh
$ npm test
```
