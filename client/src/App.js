import TextEditor from "./components/TextEditor";
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'

function App() {

  const randomName = () => {
    let alphabet = `1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik9ol0pQAZWSXEDCRFVTGBYHNUJMIKOL`
    let count = 24;
    let str = ""
    for (var i = 0; i < count; i++) {
      str += alphabet[Math.floor(Math.random() * alphabet.length)]
      if (i % 5 == 1) str += '-';
    }
    return str;
  }

  return (
    <Router>
      <Switch>
        <Route path="/" exact >
          <Redirect to={`/document/${randomName()}`} />
        </Route>
        <Route path="/document/:id" exact >
          <TextEditor />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
