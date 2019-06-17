import { createSelector } from 'reselect';
import { initialState } from './reducer';

const selectDataGrid = state => state.get('grid', initialState);

/**
 * Reselect agGrid API selector
 */
const makeSelectAPI = () =>
  createSelector(selectDataGrid, gridState => gridState.get('API'));

/**
 * Reselect CRUD routes selector
 */
const makeSelectRoutes = () =>
  createSelector(selectDataGrid, gridState => gridState.get('routes'));

/**
 * Reselect current data model selector
 */
const makeSelectCurrentModel = () =>
  createSelector(selectDataGrid, globalState =>
    globalState.get('currentModel'),
  );

export {
  selectDataGrid,
  makeSelectAPI,
  makeSelectRoutes,
  makeSelectCurrentModel,
};
