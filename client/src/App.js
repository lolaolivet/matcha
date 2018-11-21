import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      members: []
    };
  }

  componentDidMount() {
    fetch('/users')
    .then(res => res.json())
    .then(members => {
      this.setState({ members: members });
    });
  }
  render() {
    return (
      <div className="Users">
        <h1>Users</h1>
        {this.state.members.map(member =>
          <form>
            <label>
              Firstname:
              <input type="text" name="firstname" value={member.firstname} />
            </label>
            <label>
              Lastname:
              <input type="text" name="lastname" value={member.lastname} />
            </label>
            <label>
              Email:
              <input type="email" name="email" value={member.email} />
            </label>
          </form>
        )}
      </div>
    );
  }
}


export default App;
