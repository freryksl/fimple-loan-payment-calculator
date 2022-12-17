import { AppContext } from "./components/context.js"
import 'bootstrap/dist/css/bootstrap.min.css';

import Body from "./components/body.js"

import './App.css';

function App() {
  const appContext = {
    /* It sums previous and next value */
    sum: (arr) => {
      return arr.reduce((prev, next) => prev+next, 0)
    },
    /* To sum values inside different objects */
    totalRows: (object, objectKey) => {
      let rows = []
      object.forEach(val => rows.push(val[objectKey]))
      return appContext.sum(rows)
    }
  }
  return (
    <AppContext.Provider value={appContext}>
      <Body />
    </AppContext.Provider>
  );
}

export default App;
