import React, { Component } from 'react';

import Modal from '../components/modal/Modal';
import Backdrop from '../components/backdrop/Backdrop';
import AuthContext from '../context/auth-context';
import '../index.css';
import './Events.css';

class EventsPage extends Component {
    state = {
        creating: false,
        events: []
    };

    static contextType=AuthContext;

    constructor(props){
        super(props);
        const thisObj=this;
        this.fetchEvents=this.fetchEvents.bind(this);
        this.titleElRef=React.createRef();
        this.priceElRef=React.createRef();
        this.dateElRef=React.createRef();
        this.descriptionElRef=React.createRef();
    }

    componentDidMount(){
        this.fetchEvents();
    }

    startCreateEventHandler = () => {
        this.setState({creating: true});
    }

    modalConfirmHandler = () => {
        this.setState({creating: false});
        const title=this.titleElRef.current.value;
        const price=+this.priceElRef.current.value;
        const date=this.dateElRef.current.value;
        const description=this.descriptionElRef.current.value;

        if(title.trim().length==0 || price<=0 || date.trim().length==0 || description.trim().length==0){
            return;
        }

        const event={title, price, date, description};
        console.log(event);

        const requestBody = {
            query: `
                mutation {
                  createEvent(eventInput: {title: "${title}", description: "${description}", price: ${price}, date: "${date}"}) {
                    _id
                    title
                    description
                    date
                    price
                    creator {
                      _id
                      email
                    }
                  }
                }
              `
          };
        
        const token=this.context.token;
        const thisObj=this;
        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(function(res){
            if(!(res.status == 200 || res.status == 201)){
                console.log(res);
                throw new Error('Failed!');
            }
            return res.json();
        }).then(function(resData){
            console.log(resData);
            thisObj.fetchEvents();
        }).catch(function(err){
            console.log("fetch error: ", err);
        });
    }

    modalCancelHandler = () => {
        this.setState({creating: false});
    }

    fetchEvents = () => {
        const thisObj=this;
        const requestBody = {
            query: `
                query {
                  events {
                    _id
                    title
                    description
                    date
                    price
                    creator {
                      _id
                      email
                    }
                  }
                }
              `
          };      
        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(res){
            if(!(res.status == 200 || res.status == 201)){
                console.log(res);
                throw new Error('Failed!');
            }
            return res.json();
        }).then(function(resData){
            const events=resData.data.events;
            thisObj.setState({events: events});
        }).catch(function(err){
            console.log("fetch error: ", err);
        });
    }

    render() {
        const eventList=this.state.events.map(function(event){
            return (<li key={event._id} className="events__list-item">{event.title}</li>);
        });

        return (
            <React.Fragment>
                {this.state.creating && <Backdrop />}
                {this.state.creating && (
                    <Modal title="Add Event" canCancel canConfirm 
                    onCancel={this.modalCancelHandler} 
                    onConfirm={this.modalConfirmHandler}
                    >
                    <form>
                        <div className="form-control">
                            <label htmlFor="title">Title</label>
                            <input type="text" id="text" ref={this.titleElRef} ></input>
                        </div>
                        <div className="form-control">
                            <label htmlFor="price">Price</label>
                            <input type="number" id="price" ref={this.priceElRef}  ></input>
                        </div>
                        <div className="form-control">
                            <label htmlFor="date">Date</label>
                            <input type="datetime-local" id="date" ref={this.dateElRef} ></input>
                        </div>
                        <div className="form-control">
                            <label htmlFor="description">Description</label>
                            <textarea id="description" rows="4" ref={this.descriptionElRef} />
                        </div>
                    </form>
                    </Modal> 
                )}
                {this.context.token && (
                    <div className="events-control">
                        <p>Share your own Events!</p>
                        <button className="btn" onClick={this.startCreateEventHandler}>Create Event</button>
                    </div>
                )}
                <ul className="events__list">
                    {eventList}
                </ul>
            </React.Fragment>
        );
    }
}

export default EventsPage;