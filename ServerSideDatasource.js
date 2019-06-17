import { getAuthHeader } from 'utils/getAuthHeader';
import { API_URL } from '../../constants';

/**
 * Data source for agGrid
 */
class ServerSideDatasource {
  constructor(
    collectionName,
    api,
    getRowsRoute = `ag-grid/${collectionName}/getRows`,
  ) {
    this.collectionName = collectionName;
    this.api = api;
    this.getRowsRoute = getRowsRoute;
  }

  /**
   * Method for fetching rows in table
   * @param params agGrid params
   */
  getRows(params) {
    console.log('ServerSideDatasource.getRows: params = ', params); // eslint-disable-line

    const requestForServer = JSON.stringify(params.request);
    const httpRequest = new XMLHttpRequest();
    httpRequest.open('POST', `${API_URL}/${this.getRowsRoute}`);
    httpRequest.setRequestHeader('Content-type', 'application/json');
    httpRequest.setRequestHeader(
      'Authorization',
      getAuthHeader().Authorization,
    );
    httpRequest.send(requestForServer);
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === 4 && httpRequest.status === 200) {
        const httpResponse = JSON.parse(httpRequest.responseText);

        params.successCallback(httpResponse.rows, httpResponse.lastRow);
        /* If there is no rows to show, display respective overlay */
        if (httpResponse.lastRow === 0) {
          this.api.showNoRowsOverlay();
        }
      }
    };
  }
}

export default ServerSideDatasource;
