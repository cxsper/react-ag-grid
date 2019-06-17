import { fromJS } from 'immutable';

import { SET_API, SET_ROUTES, CURRENT_MODEL_SET } from './constants';

export const initialState = fromJS({
  API: false,
  routes: false,
});

const dataGridReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_API:
      return state.set('API', action.API);
    case SET_ROUTES:
      return state.set('routes', action.routes);
    case CURRENT_MODEL_SET:
      return state.set('currentModel', action.currentModel);
    default:
      return state;
  }
};

export default dataGridReducer;
