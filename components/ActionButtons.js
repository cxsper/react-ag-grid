import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { getShownActions, performAction } from '../utils';

/**
 * List of action buttons component
 */
class ActionButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shownActions: getShownActions(props.model, props.data),
    };
  }

  /**
   * Handles action
   * @param action to be handled
   */
  handleAction(action) {
    const { api, data, model } = this.props;
    performAction({
      action,
      api,
      data,
      model,
      ...this.props.properties,
    });
  }

  /**
   * render
   * @returns {Object[]} action buttons
   */
  render() {
    const {
      data: { _id },
    } = this.props;

    return this.state.shownActions.map(action => (
      <Button
        key={`${action.action.link} ${_id}`}
        type="button"
        className="btn grid-action"
        style={{
          backgroundColor: action.backgroundColor,
          borderColor: action.borderColor,
          color: action.textColor,
        }}
        title={action.description}
        onClick={() => {
          this.handleAction(action);
        }}
      >
        <i className={`fa fa-${action.icon.link}`} />
      </Button>
    ));
  }
}

ActionButtons.propTypes = {
  model: PropTypes.object.isRequired,
  data: PropTypes.object,
  properties: PropTypes.object.isRequired,
  api: PropTypes.object.isRequired,
};

export default ActionButtons;
