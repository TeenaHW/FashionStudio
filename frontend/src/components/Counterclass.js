import React from "react";

class CounterClass extends React.Component{
    constructor(){
        super();
        this.increaseNumber = this.increaseNumber.bind(this)
        this.state = {
            Number: 0
        }
    }

    increaseNumber() {
        this.setState(prevState => ({
            Number: prevState.Number + 1
        }));
    }

    render(){
        return(
            <div>
                <h3>Class base Components</h3>
                <h1>Counter = {this.state.Number}</h1>
                <button onClick={e => this.increaseNumber()}>Increment</button>
            </div>
        )
    }
}

export default CounterClass;