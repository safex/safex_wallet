import React from 'react';
import Header from './Header';

const Container = (props) => (
    <div className="App">
        <Header />
        {props.children}
    </div>
);

export default Container;