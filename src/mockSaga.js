import isGenerator from 'is-generator';
import isPromise from 'is-promise';

const { fn: isGeneratorFn } = isGenerator;

class MockSaga {
  constructor() {
    this.watchers = [];
  }

  createMiddleware() {
    return store => {
      this.getState = store.getState;
      this.dispatch = store.dispatch;
      return next => action => {
        console.log('Middleware triggered:', action);
        this.triggerWatchers(action);
        next(action);
      };
    };
  }

  triggerWatchers(action) {
    let watchersToTerminate = new Set([]);
    this.watchers.forEach(watcher => {
      const { pattern, saga, source } = watcher;
      if (this.isPatternMatching(pattern, action.type)) {
        this.runOrResume(
          saga,
          [action],
          this.getInitialYieldValue(source, action),
        );

        if (this.shouldWatcherTerminated(source))
          watchersToTerminate.add(watcher);
      }
    });

    this.watchers = this.watchers.filter(
      watcher => !watchersToTerminate.has(watcher),
    );
  }

  isPatternMatching(pattern, actionType) {
    if (pattern === '*') return true;
    if (typeof pattern === 'function') return pattern(actionType);
    return pattern === actionType;
  }

  getInitialYieldValue(source, action) {
    if (source === 'take') return action;
    return null;
  }

  shouldWatcherTerminated(source) {
    if (source === 'take') return true;
    return false;
  }

  runOrResume = async (saga, args = [], initialYieldValue) => {
    let iterator = isGeneratorFn(saga) ? saga(...args) : saga;
    let lastYieldValue = initialYieldValue;

    try {
      while (true) {
        let { value, done } = iterator.next(lastYieldValue);
        if (done) return value;
        const yieldedResult = this.handleEffect(value, iterator);

        console.log('yieldedResult', yieldedResult);

        this.handlePromiseError(yieldedResult.value);
        if (yieldedResult.nonBlocking) lastYieldValue = yieldedResult.value;
        else lastYieldValue = await yieldedResult.value;

        if (yieldedResult.suspend) break;
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  handlePromiseError(promise) {
    if (isPromise(promise))
      promise.catch(error => {
        console.log('error', error);
      });
  }

  handleEffect = (payload, saga) => {
    const { args, handler } = payload;
    return this[handler].apply(this, args.concat(saga));
  };

  takeEvery = (pattern, saga) => {
    const newWatcher = {
      pattern,
      saga,
      source: 'takeEvery',
    };
    this.watchers.push(newWatcher);
    return {
      value: null,
      suspend: false,
    };
  };

  takeLatest = (pattern, saga) => {
    const newWatcher = {
      pattern,
      saga,
      source: 'takeLatest',
    };
    this.watchers.push(newWatcher);
    return {
      value: null,
      suspend: false,
    };
  };

  call(fn, args) {
    const returnValue = fn(...args);
    if (isPromise(returnValue))
      return {
        value: returnValue,
        suspend: false,
      };

    if (isGenerator(returnValue))
      return {
        value: this.runOrResume(fn, args),
        suspend: false,
      };

    return {
      value: returnValue,
      suspend: false,
    };
  }

  put(action) {
    this.dispatch(action);
    return {
      value: null,
      suspend: false,
    };
  }

  select(selector) {
    let value;
    if (!selector) value = this.getState();
    else value = selector(this.getState());
    return {
      value,
      suspend: false,
    };
  }

  take(pattern, currentSaga) {
    const newWatcher = {
      pattern,
      saga: currentSaga,
      source: 'take',
    };
    this.watchers.push(newWatcher);
    return {
      value: null,
      suspend: true,
    };
  }

  fork(fn, ...args) {
    const returnValue = fn(...args);
    if (isPromise(returnValue))
      return {
        value: returnValue,
        suspend: false,
        nonBlocking: true,
      };

    if (isGenerator(returnValue))
      return {
        value: this.runOrResume(fn, args),
        suspend: false,
        nonBlocking: true,
      };

    return {
      value: returnValue,
      suspend: false,
      nonBlocking: true,
    };
  }

  all(effects, saga) {
    const allValues = Promise.all(
      effects.map(effect => {
        const { value, nonBlocking } = this.handleEffect(effect, saga);
        if (nonBlocking) return;
        return value;
      }),
    );
    return { value: allValues };
  }
}

export default function createSagaMiddleware() {
  const mockSagaInstance = new MockSaga();
  const middlewareCreator = mockSagaInstance.createMiddleware();
  middlewareCreator.run = mockSagaInstance.runOrResume;
  return middlewareCreator;
}
