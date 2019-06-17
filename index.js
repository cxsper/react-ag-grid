import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import 'ag-grid-enterprise';
import { Link } from 'react-router-dom';
import bindThisToFunctions from 'utils/bindThisToFunctions';
import injectReducer from 'utils/injectReducer';
import { applicationSucceed, applicationErrored } from 'containers/App/actions';
import { showModal } from 'containers/Modal/actions';
import history from 'utils/history';
import stripEndingSlash from 'utils/stripEndingSlash';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import ServerSideDatasource from './ServerSideDatasource';
import { generateGridOptions } from './utils';
import { setGridAPI, setRoutes, setCurrentModel } from './actions';
import './index.scss';
import reducer from './reducer';

class Grid extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      model: props.model, // eslint-disable-line
    };

    /* If there is a collectionName specified, replace modelName with it */
    if (props.collectionName) {
      this.state.model.modelName = props.collectionName;
    }

    bindThisToFunctions(this, this.onGridReady);

    this.state.gridOptions = generateGridOptions(this.props);

    const {
      crudRoute,
      createRoute,
      updateRoute,
      deleteRoute,
      cloneRoute,
      getRowsRoute,
    } = props;

    /* Set current model to redux */
    props.onModelPassed(props.model);

    /* Set CRUD paths to redux */
    props.onRoutesPassed({
      crudRoute,
      createRoute,
      updateRoute,
      deleteRoute,
      cloneRoute,
      getRowsRoute,
    });
  }

  /**
   * render
   * @returns {Object} agGrid with creation block
   */
  render() {
    return (
      <div>
        <div className="panel panel-default">
          <div className="panel-body">
            <h1>
              {this.props.collectionNameToShow || this.state.model.fullName}
            </h1>

            <Link
              className="btn btn-primary"
              to={`${stripEndingSlash(history.location.pathname)}/create`}
            >
              <FormattedMessage {...messages.create} />
            </Link>
          </div>
        </div>
        <div id="grid" className="ag-theme-material">
          <AgGridReact
            gridOptions={this.state.gridOptions}
            onGridReady={this.onGridReady}
          />
        </div>
      </div>
    );
  }

  /**
   * Creates agGrid data source when the grid is ready
   * @param params agGrid params
   */
  onGridReady(params) {
    /* Set grid API to redux */
    this.props.onAPIReady(params.api);

    const datasource = new ServerSideDatasource(
      this.state.model.modelName,
      params.api,
      this.props.getRowsRoute,
    );

    params.api.setServerSideDatasource(datasource);
  }
}

Grid.propTypes = {
  model: PropTypes.object.isRequired,
  getRowsRoute: PropTypes.string,
  createRoute: PropTypes.string,
  deleteRoute: PropTypes.string,
  updateRoute: PropTypes.string,
  cloneRoute: PropTypes.string,
  crudRoute: PropTypes.string,
  collectionName: PropTypes.string,
  collectionNameToShow: PropTypes.string,
  onAPIReady: PropTypes.func.isRequired,
  onModelPassed: PropTypes.func.isRequired,
  appSucceed: PropTypes.func.isRequired,
  appErrored: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    onAPIReady: api => dispatch(setGridAPI(api)),
    onModelPassed: model => dispatch(setCurrentModel(model)),
    onRoutesPassed: routes => dispatch(setRoutes(routes)),
    appSucceed: message => dispatch(applicationSucceed(message)),
    appErrored: message => dispatch(applicationErrored(message)),
    showModal: content => dispatch(showModal(content)),
  };
}

const withReducer = injectReducer({ key: 'grid', reducer });

const withConnect = connect(
  null,
  mapDispatchToProps,
);

export default compose(
  withReducer,
  withConnect,
)(Grid);
