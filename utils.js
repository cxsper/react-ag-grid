import _ from 'lodash';
import history from 'utils/history';
import stripEndingSlash from 'utils/stripEndingSlash';
import { SAME_PATH_ACTIONS } from 'containers/ActionsLayer/constants';
import stubInterpolatedProperties from 'utils/stubInterpolatedProperties';
import bindThisToFunctions from 'utils/bindThisToFunctions';
import Modal from 'containers/Modal';
import { store } from '../../app';
import ActionCellRenderer from './components/renderers/ActionCellRenderer';
import LookupObjectRenderer from './components/renderers/LookupObjectRenderer';

const modelNameAttribute = ':modelName';

/* eslint-disable no-underscore-dangle */
/**
 * Class to modify actions to be used on buttons or context menu
 */
class ActionsModifier {
  constructor({ data, model }) {
    this.data = data;
    this.model = model;
    this.modelActions = model.actions.fields;

    bindThisToFunctions(
      this,
      this.filterHiddenActions,
      this.transformDefaultActions,
      this.transformOldFormLinks,
      this.transformRouteParamsToData,
    );

    this.shownActions = Object.keys(this.modelActions);
    this.shownActions = this.shownActions
      .filter(this.filterHiddenActions)
      .map(actionName => ({ ...this.modelActions[actionName], actionName }))
      .map(this.transformOldFormLinks)
      .map(this.transformDefaultActions)
      .map(this.transformRouteParamsToData);
  }

  /**
   * Filters out hidden actions to not display them
   * @param actionName name of an action
   * @returns {Boolean} whether or not the action should be displayed
   */
  filterHiddenActions(actionName) {
    const {
      data: { _actions },
      modelActions,
    } = this;
    if (modelActions[actionName].showInTable === false) {
      return false;
    }

    /* If there is no such action on specific row */
    if (_actions) {
      return _actions[actionName];
    }

    return true;
  }

  /**
   * Transforms default actions which are not properly defined in model (currently they're just 'clone', or 'create'
   * but we need a url pattern like 'current/path/clone/:_id'
   *
   * @param action to be transformed
   * @returns {Object} action with a transformed link
   */
  transformDefaultActions(action) {
    const { actionName } = action;
    const actionToReturn = _.cloneDeep(action);
    /* If action is update/delete/clone etc which paths patterns are similar  */
    if (SAME_PATH_ACTIONS.includes(actionName)) {
      const { pathname } = history.location;

      actionToReturn.action.link = `${stripEndingSlash(
        pathname,
      )}/${actionName}/:_id`;
      actionToReturn.action.type = 'link';
    }

    return actionToReturn;
  }

  /**
   * Injects route parameters to an action url pattern
   * @param action route parameters to be injected in
   * @returns {Object} action with route parameters injected
   */
  transformRouteParamsToData(action) {
    const { data, currentModel } = this;
    if (!data) return action;

    const actionToReturn = { ...action };

    actionToReturn.action.link = stubInterpolatedProperties({
      target: action.action.link,
      object: { ...data },
      delimeter: '/',
      prefix: ':',
      /* Specify additional actions to be executed on a link part found */
      additionalMappings: linkPart => {
        /* If :modelName is found, inject the model name */
        if (linkPart === modelNameAttribute) {
          return currentModel.modelName;
        }
        return false;
      },
    });

    return actionToReturn;
  }

  /**
   * Transforms old links like /#/old/:link
   * @param action url of which has to be transformed
   * @returns {Object} action with a transformed link
   */
  transformOldFormLinks(action) {
    const { link } = action.action;

    if (link.indexOf('/#/') === 0) {
      return {
        ...action,
        action: {
          ...action.action,
          link: link.slice(2),
        },
      };
    }

    return action;
  }
}

/**
 * Gets shown actions with all needed modifiers applied
 * @param model of a data
 * @param data
 * @returns {Array} shown actions
 */
export const getShownActions = (model, data) =>
  new ActionsModifier({ data, model }).shownActions;

/**
 * Performs action (e.g. it's code defined for custom action)
 * @param props
 * @param props.action
 * @param props.data
 * @param props.model
 * @param props.showModal
 * @param props.setCurrentAction
 * @param props.gridAPI
 * @param props.appSucceed
 * @param props.appErrored
 */
export const performAction = ({
  action,
  data,
  model,
  showModal,
  setCurrentAction,
  gridAPI,
  appSucceed,
  appErrored,
}) => {
  const { link, type } = action.action;

  if (type === 'link') {
    /* If it is external link - redirect to it, otherwise use react router history to change current location */
    if (link.indexOf('http') === 0) {
      window.location = link;
    } else {
      history.push(link);
    }
  } else if (type === 'action') {
    /* Import and execute custom module for a custom action */
    import(`custom_assets/public/js/custom-actions/${link}`).then(M => {
      M.default.handleAction({
        data,
        model,
        store,
        showModal,
        setCurrentAction,
        Modal,
        gridAPI,
        appSucceed,
        appErrored,
      });
    });
  }
};

/**
 * Generates context menu actions items
 * @param props of DataGrid
 * @returns {function(Object=): Object[]} a function to return a list of context menu items
 */
const getContextMenuItems = props => params => {
  const { data } = params.node;
  const { model } = props;

  const shownActions = getShownActions(model, data);

  return [
    ...shownActions.map(shownAction => ({
      name: shownAction.description,
      action: () => {
        performAction({
          action: shownAction,
          data,
          model,
          gridAPI: params.api,
          ...props,
        });
      },
    })),
    ...params.defaultItems,
  ];
};

/**
 * Generates agGrid options
 * @param props of a DataGrid
 * @returns {Object} agGrid options
 */
export const generateGridOptions = props => ({
  defaultColDef: {
    filter: 'text',
    filterParams: {
      newRowsAction: 'keep',
    },
    allowedAggFuncs: ['sum', 'min', 'max'],
    sortable: true,
    resizable: true,
    enableRowGroup: true,
  },
  columnDefs: generateColumnDefs(props),
  sideBar: {
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        toolPanelParams: {
          suppressRowGroups: true,
          suppressValues: true,
          suppressPivots: true,
          suppressPivotMode: true,
          suppressSideButtons: true,
          suppressColumnFilter: true,
          suppressColumnSelectAll: true,
          suppressColumnExpandAll: true,
        },
      },
    ],
    defaultToolPanel: 'filter',
  },
  rowModelType: 'serverSide',
  rowGroupPanelShow: 'always',
  animateRows: true,
  suppressDragLeaveHidesColumns: true,
  suppressCellSelection: true,
  debug: true,
  cacheBlockSize: 100,
  getContextMenuItems: getContextMenuItems(props),
});

/**
 * Generates agGrid columns' definitions
 * @param props of a DataGrid
 * @returns {Object} agGrid column definitions
 */
export const generateColumnDefs = props => {
  const {
    model: { fields },
  } = props;

  const fieldNames = Object.keys(fields);

  /* Add createdAt to sort by it by default */
  if (fields.createdAt) {
    fieldNames.push('createdAt');
  }

  const types = {
    String: 'Text',
    Date: 'Date',
    Number: 'Number',
    Set: 'Set',
    Boolean: 'Text',
    LookupObjectID: 'Text',
    'LookupObjectID[]': 'Text',
    DynamicList: 'Text',
    DateTime: 'Date',
    ObjectID: 'Text',
    'String[]': 'Text',
    'Date[]': 'Date',
    'Number[]': 'Number',
    'Boolean[]': 'Boolean',
    'DateTime[]': 'DateTime',
    'Object[]': 'Text',
  };

  /* Specify custom cell renderers */
  const cellRenderers = {
    LookupObjectID: {
      framework: LookupObjectRenderer,
      props: {},
    },
    'LookupObjectID[]': {
      framework: LookupObjectRenderer,
      props: {
        isMulti: true,
      },
    },
  };

  const columnDefs = fieldNames.map(key => {
    const field = fields[key];

    const columnDef = {
      headerName: field.fullName,
      field: key,
      filter: `ag${types[field.type]}ColumnFilter`,
      minWidth: field.width,
      hide: !field.showInDatatable,
      suppressToolPanel: !field.showInDatatable,
    };

    const cellRenderer = cellRenderers[field.type];
    if (cellRenderer) {
      if (field.lookup) {
        cellRenderers.LookupObjectID.props.isMultiSource =
          Object.keys(field.lookup.table).length > 1;
      }

      columnDef.cellRendererFramework = cellRenderer.framework;
      columnDef.cellRendererParams = cellRenderer.props;
    }

    if (key === 'createdAt') {
      columnDef.sort = 'desc';
    }

    return columnDef;
  });

  columnDefs.push({
    headerName: 'Actions',
    field: 'actions',
    cellRendererFramework: ActionCellRenderer,
    cellRendererParams: {
      model: props.model,
      properties: props,
    },
    width: 110,
  });

  return columnDefs;
};
