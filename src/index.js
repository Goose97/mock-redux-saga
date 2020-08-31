import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import Counter from './components/Counter';
import counter from './reducers';
import createSagaMiddleware from './mockSaga';
// import createSagaMiddleware from 'redux-saga';
import mySaga from './testSaga';

const mockSagaMiddleware = createSagaMiddleware();

const store = createStore(counter, applyMiddleware(mockSagaMiddleware));
const rootEl = document.getElementById('root');

const render = () =>
  ReactDOM.render(
    <Counter
      value={store.getState()}
      onIncrement={() => store.dispatch({ type: 'INCREMENT' })}
      onDoubleIncrement={() => store.dispatch({ type: 'DOUBLE_INCREMENT' })}
      onDecrement={() => store.dispatch({ type: 'DECREMENT' })}
      onDoubleDecrement={() => store.dispatch({ type: 'DOUBLE_DECREMENT' })}
    />,
    rootEl,
  );

render();
store.subscribe(render);
mockSagaMiddleware.run(mySaga);
