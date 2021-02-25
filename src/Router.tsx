import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import App from "./App";
const Routing = () => {
  return (
    <Router>
      <Switch>
        <Route path="/">
          <App />
        </Route>
      </Switch>
    </Router>
  );
};

export default Routing;
