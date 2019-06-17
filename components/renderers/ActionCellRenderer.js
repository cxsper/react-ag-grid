import React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import $ from 'jquery';
import ActionList from '../ActionButtons';

/* eslint-disable no-underscore-dangle */
/**
 * Custom agGrid cell renderer for actions
 */
class ActionCellRenderer extends React.Component {
  constructor(props) {
    super(props);

    const { data } = props;

    this.state = { id: data && data._id && `actions-dropdown-${data._id}` };

    this.handleDropdownToggle = this.handleDropdownToggle.bind(this);
  }

  /**
   * Handles action dropdown toggle
   */
  handleDropdownToggle() {
    $(`#${this.state.id}`)
      .parents('.ag-row')
      .toggleClass('on-top');
  }

  /**
   * render
   * @returns {Object} action cell content
   */
  render() {
    const { id } = this.state;
    if (id) {
      return (
        <Dropdown id={id} onToggle={this.handleDropdownToggle}>
          <Dropdown.Toggle />
          <Dropdown.Menu>
            <MenuItem className="actions-dropdown-item">
              <ActionList {...this.props} />
            </MenuItem>
          </Dropdown.Menu>
        </Dropdown>
      );
    }

    return <div />;
  }
}

export default ActionCellRenderer;
