export function takeEvery(pattern, callback) {
  return {
    args: [pattern, callback],
    handler: 'takeEvery',
  };
}

export function call(fn, ...args) {
  return {
    args: [fn, args],
    handler: 'call',
  };
}

export function fork(fn, ...args) {
  return {
    args: [fn, args],
    handler: 'fork',
  };
}

export function put(action) {
  return {
    args: [action],
    handler: 'put',
  };
}

export function select(selector) {
  return {
    args: [selector],
    handler: 'select',
  };
}

export function take(pattern) {
  return {
    args: [pattern],
    handler: 'take',
  };
}
