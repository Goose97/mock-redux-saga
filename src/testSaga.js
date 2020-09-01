import { takeEvery, call, put, take, fork } from './mockSagaEffect';
// import { takeEvery, call, put, take, fork } from 'redux-saga/effects';

async function fakeApiCall(timeout) {
  console.log('heello');
  await new Promise(resolve => {
    setTimeout(() => resolve(timeout), timeout);
  }).then(() => console.log('promise settled'));
  console.log('heello1');
}

function* testCall(action) {
  const apiReponse = yield fork(fakeApiCall, 2000);
  const apiReponse1 = yield fork(fakeApiCall, 4000);
  console.log('apiReponse', apiReponse);
  console.log('apiReponse1', apiReponse1);
  // if (apiReponse === 99)
  //   yield put({
  //     type: 'DECREMENT',
  //   });

  console.log('mami');
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
