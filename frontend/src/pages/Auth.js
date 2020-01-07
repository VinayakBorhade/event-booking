import React, { Component } from 'react';

import './Auth.css';
import AuthContext from '../context/auth-context';

class AuthPage extends Component {

    state={
        isLogin: true
    };

    static contextType = AuthContext;
    
    constructor(props){
        super(props);
        this.emailEl=React.createRef();
        this.passwordEl=React.createRef();
        console.log("in constructor: ", this);
    };

    switchModeHandler = () => {
        this.setState(function(prevState){
            return {isLogin: !prevState.isLogin };
        });
    };

    submitHandler = (event) => {
        event.preventDefault();
        console.log("in submitHandler: ", this);
        const email=this.emailEl.current.value;
        const password=this.passwordEl.current.value;
        if(email.trim().length===0 || password.trim().length===0){
            return;
        }
        let requestBody = {
            query: `
                query{
                    login(email: "${email}", password: "${password}") {
                        userId
                        token
                        tokenExpiration
                    }
                }
            `
        };
        if(!this.state.isLogin){
            requestBody = {
                query: `
                    mutation {
                        createUser(userInput: {email: "${email}", password: "${password}"}) {
                            _id
                            email
                        }
                    }
                `
            };
        }
        var thisObj=this;
        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(res){
            if(!(res.status == 200 || res.status == 201)){
                throw new Error(res.status);
            }
            console.log("inside, fetch callack, this, ", this, " \n res: ", res);
            return res.json();
        }).then(function(resData){
            // console.log("this: ", this);
            if(resData.data.login.token){
                thisObj.context.login(
                    resData.data.login.token,
                    resData.data.login.userId,
                    resData.data.login.tokenExpiration,
                );
            }
        }).catch(function(err){
            console.log("fetch error: ", err);
        });
    };

    render() {
        console.log("inside return(), this: ", this);
        return (
            <form className="auth-form" onSubmit={this.submitHandler}>
                <div className="form-control">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" ref={this.emailEl} />
                </div>
                <div className="form-control">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" ref={this.passwordEl} />
                </div>
                <div className="form-actions">
                    <button type="submit">Submit</button>
                    <button type="button" onClick={this.switchModeHandler} >
                        Switch to {this.state.isLogin ? 'Signup' : 'Login'} 
                    </button>
                </div>
            </form>
        );
    };
};

export default AuthPage;