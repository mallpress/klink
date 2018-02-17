/// <reference path="../klink.ts" />

import {} from 'jasmine';

import {Klink} from '../klink';

describe("Select", function() {
    it("when given a list of integers are used", function() {
        let input = [0,1,2,3,4,5,6,7,8,9];
        let r = Klink.fromArray(input);
        let result = r.select((i) => i).toArray();
        expect(result).toEqual(input);
    });
    it("when given a list of characters are used", function() {
        let input = ['a','b','c','d','e','f','g','h','i','j'];
        let r = Klink.fromArray(input);
        let result = r.select((i) => i).toArray();
        expect(result).toEqual(input);
    });
});

describe("Skip", function() {
    it("when given a list of integers are used", function() {
        let input = [0,1,2,3,4,5,6,7,8,9];
        let r = Klink.fromArray(input);
        let result = r.skip(4).toArray();
        expect(result).toEqual([4,5,6,7,8,9]);
    });
    it("when given a list of characters are used", function() {
        let input = ['a','b','c','d','e','f','g','h','i','j'];
        let r = Klink.fromArray(input);
        let result = r.skip(4).toArray();
        expect(result).toEqual(['e','f','g','h','i','j']);
    });
});

describe("Skip While", function() {
    it("when given a list of integers are used", function() {
        let input = [0,1,2,3,4,5,6,7,8,9];
        let r = Klink.fromArray(input);
        let result = r.skipWhile(i => i < 5).toArray();
        expect(result).toEqual([5,6,7,8,9]);
    });
    it("when given a list of characters are used", function() {
        let input = ['a','b','c','d','e','f','g','h','i','j'];
        let r = Klink.fromArray(input);
        let result = r.skipWhile(i => i != 'c').toArray();
        expect(result).toEqual(['c','d','e','f','g','h','i','j']);
    });
});

describe("Take", function() {
    it("when given a list of integers are used", function() {
        let input = [0,1,2,3,4,5,6,7,8,9];
        let r = Klink.fromArray(input);
        let result = r.take(4).toArray();
        expect(result).toEqual([0,1,2,3]);
    });
    it("when given a list of characters are used", function() {
        let input = ['a','b','c','d','e','f','g','h','i','j'];
        let r = Klink.fromArray(input);
        let result = r.take(4).toArray();
        expect(result).toEqual(['a','b','c','d']);
    });
});

describe("Take While", function() {
    it("when given a list of integers are used", function() {
        let input = [0,1,2,3,4,5,6,7,8,9];
        let r = Klink.fromArray(input);
        let result = r.takeWhile(i => i < 5).toArray();
        expect(result).toEqual([0,1,2,3,4]);
    });
    it("when given a list of characters are used", function() {
        let input = ['a','b','c','d','e','f','g','h','i','j'];
        let r = Klink.fromArray(input);
        let result = r.takeWhile(i => i != 'c').toArray();
        expect(result).toEqual(['a','b']);
    });
});

describe("Select Many", function() {
    it("when given multiple arrays of integers", function() {
        let input = [[0,1,2,3],[4,5,6,7,8,9,10,11],[12]];
        let r = Klink.fromArray(input);
        let result = r.selectMany(i => i).toArray();
        expect(result).toEqual([0,1,2,3,4,5,6,7,8,9,10,11,12]);
    });

    it("when given multiple arrays of characters", function() {
        let input = [['a','b','c','d'], ['e','f'],['g','h','i', 'j']];
        let r = Klink.fromArray(input);
        let result = r.selectMany(i => i).toArray();
        expect(result).toEqual(['a','b','c','d','e','f','g','h','i','j']);
    });
});

describe("Concat", function() {
    it("when given two arrays of integers", function() {
        let inputA = [0,1,2,3,4];
        let inputB = [5,6,7,8,9];
        let r = Klink.fromArray(inputA).concat(Klink.fromArray(inputB)).toArray();
        expect(r).toEqual([0,1,2,3,4,5,6,7,8,9]);
    });
});

describe("Count", function() {
    it("when given an array of integers", function() {
        let input = [0,1,2,3,4,5,6,7,8,9];
        let r = Klink.fromArray(input);
        expect(r.count()).toEqual(10);
    });
});

describe("Count Where", function() {
    it("when given an array of integers", function() {
        let input = [0,1,2,3,4,5,6,7,8,9];
        let r = Klink.fromArray(input);
        expect(r.count(i => i < 6)).toEqual(6);
    });
});

describe("Aggeragate", function() {
    it("when given an array of integers multiply it out", function() {
        let input = [1,2,3,4,5,6,7,8,9];
        let r = Klink.fromArray(input);
        expect(r.aggregate<number>((out, i) => out *= i, 1)).toEqual(362880);
    });
});

describe("Map", function() {
    it("when given an array of integers map one to the next", function() {
        let input = [1,2,3,4,5,6,7,8,9];
        let r = Klink.fromArray(input);
        expect(r.toDictionary(i => i, i => i + 1)).toEqual(new Map<number, number>([[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10]]));
    });
});

describe("Single", function() {
    it("when given an array of integers with a single value", function() {
        let input = [1];
        let r = Klink.fromArray(input);
        expect(r.single()).toBe(1);
    });

    it("when given an array of integers with multiple", function() {
        let input = [1, 2];
        let r = Klink.fromArray(input);
        expect(() => r.single()).toThrow("more than one element");
    });
});

describe("Single Or Default", function() {
    it("when given an array of integers with a single value", function() {
        let input = [1];
        let r = Klink.fromArray(input);
        expect(r.singleOrDfault()).toBe(1);
    });

    it("when given an array of integers with multiple", function() {
        let input = [1, 2];
        let r = Klink.fromArray(input);
        expect(() => r.singleOrDfault()).toThrow("more than one element");
    });

    it("when given an empty array of integers", function() {
        let input = Array<number>();
        let r = Klink.fromArray(input);
        expect(r.singleOrDfault()).toBe(null);
    });
});

describe("First", function() {
    it("when given an array of integers with a single value", function() {
        let input = [1];
        let r = Klink.fromArray(input);
        expect(r.first()).toBe(1);
    });

    it("when given an array of integers with non", function() {
        let input = Array<number>();
        let r = Klink.fromArray(input);
        expect(() => r.first()).toThrow("contains no elements");
    });

    it("when given an array of integers with multiple", function() {
        let input = [1, 2];
        let r = Klink.fromArray(input);
        expect(r.first()).toBe(1);
    });
});

describe("First Or Default", function() {
    it("when given an array of integers with a single value", function() {
        let input = [1];
        let r = Klink.fromArray(input);
        expect(r.firstOrDefault()).toBe(1);
    });

    it("when given an array of integers with multiple", function() {
        let input = [1,2,4,5,6,7];
        let r = Klink.fromArray(input);
        expect(r.firstOrDefault()).toBe(1);
    });

    it("when given an empty array of integers", function() {
        let input = Array<number>();
        let r = Klink.fromArray(input);
        expect(r.firstOrDefault()).toBe(null);
    });
});

describe("Last", function() {
    it("when given an array of integers with a single value", function() {
        let input = [1];
        let r = Klink.fromArray(input);
        expect(r.last()).toBe(1);
    });

    it("when given an array of integers with non", function() {
        let input = Array<number>();
        let r = Klink.fromArray(input);
        expect(() => r.last()).toThrow("contains no elements");
    });

    it("when given an array of integers with multiple", function() {
        let input = [1, 2];
        let r = Klink.fromArray(input);
        expect(r.last()).toBe(2);
    });
});

describe("Last Or Default", function() {
    it("when given an array of integers with a single value", function() {
        let input = [1];
        let r = Klink.fromArray(input);
        expect(r.lastOrDefault()).toBe(1);
    });

    it("when given an array of integers with multiple", function() {
        let input = [1,2,4,5,6,7];
        let r = Klink.fromArray(input);
        expect(r.lastOrDefault()).toBe(7);
    });

    it("when given an empty array of integers", function() {
        let input = Array<number>();
        let r = Klink.fromArray(input);
        expect(r.lastOrDefault()).toBe(null);
    });
});

describe("All", function() {
    it("when given an array of all true bools", function() {
        let input = [true, true, true, true];
        let r = Klink.fromArray(input);
        expect(r.all(i => i)).toBe(true);
    });

    it("when given an array of all false bools", function() {
        let input = [false, false, false, false];
        let r = Klink.fromArray(input);
        expect(r.all(i => i)).toBe(false);
    });

    it("when given an array of all mixed bools", function() {
        let input = [true, false, true, false];
        let r = Klink.fromArray(input);
        expect(r.all(i => i)).toBe(false);
    });
});

describe("Any", function() {
    it("when given an array of all true bools", function() {
        let input = [true, true, true, true];
        let r = Klink.fromArray(input);
        expect(r.any(i => i)).toBe(true);
    });

    it("when given an array of all false bools", function() {
        let input = [false, false, false, false];
        let r = Klink.fromArray(input);
        expect(r.any(i => i)).toBe(false);
    });

    it("when given an array of all mixed bools", function() {
        let input = [true, false, true, false];
        let r = Klink.fromArray(input);
        expect(r.any(i => i)).toBe(true);
    });
});

describe("Group By", function() {
    it("when given an array of integers", function() {
        let input = [1,2,3,4,5,6,7,8,9];
        let r = Klink.fromArray(input);
        expect(r.groupBy(k => k % 2)).toEqual(new Map<number, number[]>([[1, [1,3,5,7,9]], [0, [2,4,6,8]]]));
    });
});