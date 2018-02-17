'use strict';
 
abstract class BaseExpression<TIn, TOut> implements Iterable<TOut> {
    _iterator : Iterator<TIn>
    constructor(iterator : Iterator<TIn>) {
        this._iterator = iterator;
    }

    abstract next(value? : any) : IteratorResult<TOut>;

    [Symbol.iterator] () : Iterator<TOut> {
        return this;
    }
}

abstract class PredicateExpression<TIn> extends BaseExpression<TIn, TIn> {
    _iterator : Iterator<TIn>
    _predicate : (item : TIn) => boolean
    constructor(iterator : Iterator<TIn>, predicate : (item : TIn) => boolean) {
        super(iterator);
        this._predicate = predicate;
    }
}

abstract class ResultingExpression<TIn, TOut> {
    _iterator : Iterator<TIn>
    _predicate : (item : TIn) => boolean
    constructor(iterator : Iterator<TIn>, predicate? : (item : TIn) => boolean) {
        this._iterator = iterator;
        this._predicate = predicate ? predicate : null;
    }

    abstract execute() : TOut
}

export class KeyValuePair<TKey, TValue> {
    key : TKey
    value : TValue
}

class SelectExpression<TIn, TOut> extends BaseExpression<TIn, TOut> {
    _iterator : Iterator<TIn>
    _func : (item : TIn) => TOut
    constructor(iterator : Iterator<TIn>, func : (item : TIn) => TOut) {
        super(iterator);
        this._func = func;
    }
    public next(value? : any) : IteratorResult<TOut> {
        let n = this._iterator.next()
        if (!n.done) {
            return { done : n.done, value : this._func(n.value) };
        }
        return { done : true, value : undefined }
    }
}

class ForEachExpression<TIn> extends BaseExpression<TIn, TIn> {
    _iterator : Iterator<TIn>
    _func : (item : TIn) => void
    constructor(iterator : Iterator<TIn>, func : (item : TIn) => void) {
        super(iterator);
        this._func = func;
    }
    public next(value? : any) : IteratorResult<TIn> {
        let n = this._iterator.next()
        if (!n.done) {
            this._func(n.value);
            return { done : n.done, value : n.value };
        }
        return { done : true, value : undefined }
    }
}

class WhereExpression<TIn> extends PredicateExpression<TIn> {
    public next(value? : any) : IteratorResult<TIn> {
        let n = this._iterator.next()
        while(!n.done) {
            if (this._predicate(n.value)) {
                return { done : n.done, value : n.value }
            }
            n = this._iterator.next();
        }
        return { done : true, value : undefined }
    }
}
    
class ReverseExpression<TIn> extends BaseExpression<TIn, TIn> {
    _values : Array<TIn>
    constructor(iterator : Iterator<TIn>) {
        super(iterator);
        this._values = new ArrayExpression(iterator).execute();
    }

    public next(value? : any) : IteratorResult<TIn> {
        let val = this._values.pop();
        if(val != null) {
            return { done : false, value : val };
        }
        return { done : true, value : undefined }
    }
}

class KeyValueExpression<TIn, TKey, TValue> extends BaseExpression<TIn, KeyValuePair<TKey, TValue>> {
    _iterator : Iterator<TIn>
    _keyFunc : (item : TIn) => TKey
    _valueFunc : (item : TIn) => TValue
    constructor(iterator : Iterator<TIn>, keyFunc : (item : TIn) => TKey, valueFunc : (item : TIn) => TValue) {
        super(iterator);
        this._keyFunc = keyFunc;
        this._valueFunc = valueFunc;
    }
    public next(value? : any) : IteratorResult<KeyValuePair<TKey, TValue>> {
        let n = this._iterator.next()
        if(!n.done) {
            let toReturn = new KeyValuePair<TKey, TValue>();
            toReturn.key = this._keyFunc(n.value);
            toReturn.value = this._valueFunc(n.value);
            return { done : n.done, value : toReturn }
        }
        return { done : true, value : undefined }
    }
}

class SkipExpression<TIn> extends BaseExpression<TIn, TIn> {
    _iterator : Iterator<TIn>
    _skipped : boolean = false
    _toSkip : number
    constructor(iterator : Iterator<TIn>, toSkip : number) {
        super(iterator);
        this._toSkip = toSkip;
    }
    public next(value? : any) : IteratorResult<TIn> {
        if(!this._skipped) {
            let n : IteratorResult<TIn> = null;
            while(this._toSkip > 0) {
                n = this._iterator.next();
                if(n.done) {
                    return { done : true, value : undefined }
                }
                this._toSkip--;
            }
            this._skipped = true;
        }
        return this._iterator.next();
    }
}

class SkipWhileExpression<TIn> extends PredicateExpression<TIn> {
    _iterator : Iterator<TIn>
    _skipped : boolean
    public next(value? : any) : IteratorResult<TIn> {
        if(!this._skipped) {
            let n = this._iterator.next();
            while(!n.done) {
                if(!this._predicate(n.value)) {
                    this._skipped = true;
                    return n;
                }
                n = this._iterator.next();
            }
        }
        return this._iterator.next();
    }
}

class TakeExpression<TIn>  extends BaseExpression<TIn, TIn> {
    _iterator : Iterator<TIn>
    _taken : boolean = false
    _toTake : number
    constructor(iterator : Iterator<TIn>, toTake : number) {
        super(iterator);
        this._toTake = toTake;
    }
    public next(value? : any) : IteratorResult<TIn> {
        if(!this._taken) {
            let n : IteratorResult<TIn> = null;
            while(this._toTake > 0) {
                n = this._iterator.next();
                if(!n.done) {
                    this._toTake--;
                    return { done : false, value : n.value }
                }
                else {
                    this._toTake = 0;
                }
            }
            this._taken = true;
        }
        return { done : true, value : undefined }
    }
}

class TakeWhileExpression<TIn> extends PredicateExpression<TIn> {
    _iterator : Iterator<TIn>
    _taken : boolean
    public next(value? : any) : IteratorResult<TIn> {
        if(!this._taken) {
            let n = this._iterator.next();
            if(n.done) {
                this._taken = true;
                return { done : true, value : undefined }
            }
            if(this._predicate(n.value)) {
                return { done : false, value : n.value }
            }
            this._taken = true;
        }
        return { done : true, value : undefined }
    }
}

class SelectManyExpression<TIn, TOut> extends BaseExpression<TIn, TOut> {
    _iterator : Iterator<TIn>
    _func : (item : TIn) => Array<TOut>
    _finished : boolean = false
    _elements : Array<TOut>
    constructor(iterator : Iterator<TIn>, func : (item : TIn) => Array<TOut>) {
        super(iterator);
        this._func = func;
        this._elements = new Array<TOut>();
    }
    public next(value? : any) : IteratorResult<TOut> {
        if(this._finished) {
            return { done : true, value : undefined }
        }
        if(this._elements.length > 0) {
            let toReturn = this._elements.splice(0, 1);
            return { done : false, value : toReturn[0] };
        }
        let n = this._iterator.next()
        while(!n.done) {            
            let res = this._func(n.value);
            if(res.length > 0) {
                let toReturn = res.splice(0, 1);
                this._elements = this._elements.concat(res);
                return { done : false, value : toReturn[0] }
            }
            n = this._iterator.next()
        }
        this._finished = true;
        return { done : true, value : undefined }
    }

}

class ConcatExpression<TIn> implements Iterable<TIn> {
    _iteratorA : Iterator<TIn>
    _iteratorB : Iterator<TIn>
    _exhaustedA : boolean
    _exhaustedB : boolean
    constructor(iteratorA : Iterator<TIn>, iteratorB : Iterator<TIn>) {
        this._iteratorA = iteratorA;
        this._iteratorB = iteratorB;
    }
    public next(value? : any) : IteratorResult<TIn> {
        if(!this._exhaustedA) {
            let n = this._iteratorA.next();
            if(n.done) {
                this._exhaustedA = true;
            }
            else {
                return n;
            }
        }

        if(!this._exhaustedB) {
            let n = this._iteratorB.next();
            if(n.done) {
                this._exhaustedB = true;
            }
            else {
                return n;
            }
        }
        return { done : true, value : undefined }
    }

    [Symbol.iterator] () : Iterator<TIn> {
        return this;
    }
}

class CountWhereExpression<TIn> extends ResultingExpression<TIn, number> {
    execute() : number {
        let count = 0;
        let n = this._iterator.next()
        if(this._predicate == null) {
            while(!n.done) {
                count++;
                n = this._iterator.next();
            }
        }
        else {
            while(!n.done) {
                if( this._predicate(n.value)) count++;
                n = this._iterator.next();
            }                
        }

        return count;
    }
}

class AggregateExpression<TIn, TOut> extends ResultingExpression<TIn, TOut> {
    _iterator : Iterator<TIn>
    _func : (res : TOut, item : TIn) => TOut
    _seed? : TOut
    constructor(iterator : Iterator<TIn>, func : (res : TOut, item : TIn) => TOut, seed? : TOut) {
        super(iterator);
        this._func = func;
        this._seed = seed;
    }
    
    execute() : TOut {
        let n = this._iterator.next();
        let currentValue = this._seed;
        
        while(!n.done) {
            currentValue = this._func(currentValue, n.value)
            n = this._iterator.next();
        }
        return currentValue;
    }
}

class ArrayExpression<TIn> extends ResultingExpression<TIn, Array<TIn>> {
    execute() : Array<TIn> {
        let toReturn = new Array<TIn>();
        let n = this._iterator.next()
        while(!n.done) {
            toReturn.push(n.value);
            n = this._iterator.next();
        }
        return toReturn;
    }
}
    
class MapExpression<TIn, TKey, TValue> extends ResultingExpression<TIn, Map<TKey, TValue>> {
    _iterator : Iterator<TIn>
    _keyFunc : (item : TIn) => TKey
    _valueFunc : (item : TIn) => TValue
    constructor(iterator : Iterator<TIn>, keyFunc : (item : TIn) => TKey, valueFunc : (item : TIn) => TValue) {
        super(iterator);
        this._keyFunc = keyFunc;
        this._valueFunc = valueFunc;
    }

    execute() : Map<TKey, TValue> {
        let toReturn = new Map<TKey, TValue>();
        let n = this._iterator.next()
        while(!n.done) {
            toReturn.set(this._keyFunc(n.value), this._valueFunc(n.value));
            n = this._iterator.next();
        }
        return toReturn;
    }
}
    
class SingleExpression<TIn> extends ResultingExpression<TIn, TIn> {
    execute() : TIn {
        let n = this._iterator.next()

        if(!n.done) {
            let next = this._iterator.next();
            if(next.done) {
                return n.value;
            }
            else {
                throw "more than one element";
            }
        }
        throw "no elements";
    }
}
        
class SingleOrDefaultExpression<TIn> extends ResultingExpression<TIn, TIn> {
    execute() : TIn {
        let n = this._iterator.next()

        if(!n.done) {
            let next = this._iterator.next();
            if(next.done) {
                return n.value;
            }
            else {
                throw "more than one element";
            }
        }
        return null;
    }
}
        
class FirstExpression<TIn> extends ResultingExpression<TIn, TIn> {
    execute() : TIn {
        let n = this._iterator.next();
        if(this._predicate != null) {
            while(!n.done) {
                if(this._predicate(n.value)) return n.value;
                n = this._iterator.next();
            }                
        }
        if(n.done) {
            throw "contains no elements";
        }
        return n.value;
    }
}

class FirstOrDefaultExpression<TIn> extends ResultingExpression<TIn, TIn> {
    execute() : TIn {
        let n = this._iterator.next();
        if(this._predicate != null) {
            while(!n.done) {
                if(this._predicate(n.value)) return n.value;  
                n = this._iterator.next();                  
            }
        }
        if(n.done) {
            return null;
        }
        return n.value;
    }
}
            
class LastExpression<TIn> extends ResultingExpression<TIn, TIn> {
    execute() : TIn {
        let n = this._iterator.next()
        let toReturn : TIn;
        if(n.done) throw "contains no elements";
        if(this._predicate != null) {
            while(!n.done) {
                if(this._predicate(n.value)) toReturn = n.value;
                n = this._iterator.next()               
            }
        }
        else {
            while(!n.done) {
                toReturn = n.value;
                n = this._iterator.next()               
            }
        }
        if (typeof toReturn !== 'undefined') {
            return toReturn;
        }
        throw "contains no elements";
    }
}   
class LastOrDefaultExpression<TIn> extends ResultingExpression<TIn, TIn> {
    execute() : TIn {
        let n = this._iterator.next();
        let toReturn : TIn = null;
        if(this._predicate != null) {
            while(!n.done) {
                if(this._predicate(n.value)) toReturn = n.value;
                n = this._iterator.next()               
            }
        }
        else {
            while(!n.done) {
                toReturn = n.value;
                n = this._iterator.next()               
            }
        }
        return toReturn;
    }
}
                
class AllExpression<TIn> extends ResultingExpression<TIn, boolean> {
    execute() : boolean {
        let n = this._iterator.next()
        while(!n.done) {
            if(!this._predicate(n.value)) {
                return false
            }
            n = this._iterator.next();
        }
        return true;
    }
}
                    
class AnyExpression<TIn> extends ResultingExpression<TIn, boolean> {
    execute() : boolean {
        let n = this._iterator.next()
        if(this._predicate != null) {
            while(!n.done) {
                if(this._predicate(n.value)) {
                    return true
                }
                n = this._iterator.next();
            }
        }
        return !n.done;
    }
}
    
class GroupByExpression<TIn, TKey> extends ResultingExpression<TIn,Map<TKey, Array<TIn>>> {
    _iterator : Iterator<TIn>
    _keyFunc : (item : TIn) => TKey
    constructor(iterator : Iterator<TIn>, keyFunc : (item : TIn) => TKey) {
        super(iterator);
        this._keyFunc = keyFunc;
    }
    public execute() : Map<TKey, Array<TIn>> {
        let toReturn = new  Map<TKey, Array<TIn>>();
        let n = this._iterator.next()

        while(!n.done) {
            let key = this._keyFunc(n.value);
            let r = toReturn.get(key);
            if(typeof r === 'undefined') {
                toReturn.set(key, [n.value])
            }
            else {
                r.push(n.value);
            }
            n = this._iterator.next();
        }
        return toReturn;
    }
}

export class Klink<TIn> implements Iterator<TIn> {
    private iterator : Iterator<TIn>

    constructor(expression : Iterator<TIn>) {
        this.iterator = expression;
    }

    select<TOut>(func : (item : TIn) => TOut) : Klink<TOut> {
        return new Klink<TOut>(new SelectExpression<TIn, TOut>(this.iterator, func));
    }

    skip(count : number) : Klink<TIn> {
        return new Klink<TIn>(new SkipExpression<TIn>(this.iterator, count));
    }
    
    skipWhile(func : (item : TIn) => boolean) : Klink<TIn> {
        return new Klink<TIn>(new SkipWhileExpression<TIn>(this.iterator, func));
    }
    
    take(count : number) : Klink<TIn> {
        return new Klink<TIn>(new TakeExpression<TIn>(this.iterator, count));
    }
            
    takeWhile(func : (item : TIn) => boolean) : Klink<TIn> {
        return new Klink<TIn>(new TakeWhileExpression<TIn>(this.iterator, func));
    }
            
    forEach(func : (item : TIn) => void) : Klink<TIn> {
        return new Klink<TIn>(new ForEachExpression<TIn>(this.iterator, func));
    }
    
    concat(iterator : Iterator<TIn>) : Klink<TIn> {
        return new Klink<TIn>(new ConcatExpression<TIn>(this.iterator, iterator));
    }
    
    where(func : (item : TIn) => boolean) : Klink<TIn> {
        return new Klink<TIn>(new WhereExpression<TIn>(this.iterator, func));
    }
            
    keyValue<TKey, TValue>(keyFunc : (item : TIn) => TKey, valueFunc : (item : TIn) => TValue) : Klink<KeyValuePair<TKey, TValue>> {
        return new Klink<KeyValuePair<TKey, TValue>>(new KeyValueExpression<TIn, TKey, TValue>(this.iterator, keyFunc, valueFunc));
    }
                    
    selectMany<TOut>(func : (item :TIn) => Array<TOut>) : Klink<TOut> {
        return new Klink<TOut>(new SelectManyExpression<TIn, TOut>(this.iterator, func));
    }

    reverse() : Klink<TIn> {
        return new Klink<TIn>(new ReverseExpression<TIn>(this.iterator));
    }

    count(predicate? : (item :TIn) => boolean) : number {
        return new CountWhereExpression<TIn>(this.iterator, predicate).execute();
    }
    
    all(predicate : (item :TIn) => boolean) : boolean {
        return new AllExpression<TIn>(this.iterator, predicate).execute();
    }
    
    any(predicate? : (item :TIn) => boolean) : boolean {
        return new AnyExpression<TIn>(this.iterator, predicate).execute();
    }

    single() : TIn {
        return new SingleExpression<TIn>(this.iterator).execute();
    }
            
    singleOrDfault() : TIn {
        return new SingleOrDefaultExpression<TIn>(this.iterator).execute();
    }
    
    first(predicate? : (item :TIn) => boolean) : TIn {
        return new FirstExpression<TIn>(this.iterator, predicate).execute();
    }

    firstOrDefault(predicate? : (item :TIn) => boolean) : TIn {
        return new FirstOrDefaultExpression<TIn>(this.iterator, predicate).execute();
    }

    last(predicate? : (item :TIn) => boolean) : TIn {
        return new LastExpression<TIn>(this.iterator, predicate).execute();
    }

    lastOrDefault(predicate? : (item :TIn) => boolean) : TIn {
        return new LastOrDefaultExpression<TIn>(this.iterator, predicate).execute();
    }

    elementAt(index : number) : TIn {
        let predicate = (v : TIn) => {
            return index-- == 0;
        }
        return new FirstExpression<TIn>(this.iterator, predicate).execute();
    }

    toArray() : Array<TIn> {
        return new ArrayExpression<TIn>(this.iterator).execute();
    }

    toDictionary<TKey, TValue>(keyFunc : (item : TIn) => TKey, valueFunc : (item : TIn) => TValue) : Map<TKey, TValue> {
        return new MapExpression<TIn, TKey, TValue>(this.iterator, keyFunc, valueFunc).execute();
    }

    groupBy<TKey>(keyFunc : (item : TIn) => TKey) : Map<TKey, Array<TIn>> {
        return new GroupByExpression<TIn, TKey>(this.iterator, keyFunc).execute();
    }

    aggregate<TOut>(func : (res : TOut, item : TIn) => TOut, seed? : TOut) : TOut {
        return new AggregateExpression<TIn, TOut>(this.iterator, func, seed).execute();
    }

    sum(func : (item : TIn) => number) : number {
        return new AggregateExpression<TIn, number>(this.iterator, (ac, v) => { return ac + func(v); }, 0).execute();
    }

    average(func : (item : TIn) => number) : number {
        let count = 0;
        let total = new AggregateExpression<TIn, number>(this.iterator, (ac, v) => { count++; return ac + func(v); }, 0).execute();
        return total / count;
    }

    public next(value? : any) : IteratorResult<TIn> {
        return this.iterator.next();
    }
    
    [Symbol.iterator] () : Iterator<TIn> {
        return this;
    }

    public static fromArray<T>(array : Array<T>) : Klink<T> {
        return new Klink<T>(function*() {
            yield* array;
        }())
    }
}

