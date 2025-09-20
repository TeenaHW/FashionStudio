import React, {useState} from "react";

function CounterFunction(){

    let [Number, setNumber] = useState(0)

    function increaseNumber2(){
        setNumber (++Number)
    }

    return(
        <dev>
            <h3>Functional Components</h3>
            <h1> Counter = {Number} </h1>
            <button onClick={e => increaseNumber2()}>Increment</button>
        </dev>
    )
}

export default CounterFunction;