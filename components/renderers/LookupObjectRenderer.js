import React from 'react';
import PropTypes from 'prop-types';

/**
 * Custom agGrid LookupObject renderer
 * TODO: implement custom rendering support
 * @param value data row
 * @param isMultiSource has multiple tables
 * @param isMulti has multiple id references
 * @returns {Object} LookupObject cell content
 * @constructor
 */
function LookupObjectRenderer({ value, isMultiSource, isMulti }) {
  if (value) {
    const labels =
      isMulti && Array.isArray(value.label)
        ? value.label.join(', ')
        : value.label;

    return (
      <div>
        {isMultiSource && value.table && `${value.table} | `}
        {labels}
      </div>
    );
  }

  return <div />;
}

LookupObjectRenderer.propTypes = {
  value: PropTypes.object,
  isMultiSource: PropTypes.bool,
  isMulti: PropTypes.bool,
};

export default LookupObjectRenderer;
