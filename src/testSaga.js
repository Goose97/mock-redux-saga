import { takeEvery, call, put, take, fork, all } from './mockSagaEffect';
// import { takeEvery, call, put, take, fork, all } from 'redux-saga/effects';

async function fakeApiCall(timeout) {
  await new Promise(resolve => {
    setTimeout(() => resolve(timeout), timeout);
  }).then(() => {
    console.log('promise settled');
  });
}

function* testCall(action) {
  yield all([call(fakeApiCall, 1000), call(fakeApiCall, 2000)]);
}

function* testTake(action) {
  const takeAction = yield take('DOUBLE_DECREMENT');
  const takeAction1 = yield take('INCREMENT');
}

function* mySaga() {
  yield takeEvery('INCREMENT', testCall);
  yield takeEvery('DECREMENT', testTake);
}

export default mySaga;
