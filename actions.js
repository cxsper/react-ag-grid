import { SET_API, SET_ROUTES, CURRENT_MODEL_SET } from './constants';

/**
 * Sets grid API
 * @param API to be set
 * @returns {{API: object, type: string}}
 */
export const setGridAPI = API => ({
  type: SET_API,
  API,
});

/**
 * Sets routes (single 'crudRoute' or explicit 'createRoute', 'deleteRoute' etc
 * @param routes
 * @returns {{routes: object, type: string}}
 */
export const setRoutes = routes => ({
  type: SET_ROUTES,
  routes,
});

/**
 * Sets current model
 * @param currentModel
 * @returns {{type: string, currentModel: object}}
 */
export const setCurrentModel = currentModel => ({
  type: CURRENT_MODEL_SET,
  currentModel,
});
