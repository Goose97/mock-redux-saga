import { takeEvery, call, put, take } from './mockSagaEffect';
// import { takeEvery, call, put, take } from 'redux-saga/effects';

function fakeApiCall(res) {
  return new Promise(resolve => {
    setTimeout(() => resolve(res), 2000);
  });
}

function* testCall(action) {
  const apiReponse = yield call(fakeApiCall, 99);
  if (apiReponse === 99)
    yield put({
      type: 'DECREMENT',
    });
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
