import React, { Component } from 'react';
import AuthContext from '../context/auth-context';

import Spinner from '../components/Spinner/Spinner';

class BookingsPage extends Component {

    state={
        isLoading: false,
        bookings: []
    };

    static contextType=AuthContext;

    componentDidMount(){
        this.fetchBookings();
    };

    fetchBookings = () => {
        this.setState({isLoading: true});
        const token=this.context.token;
        const thisObj=this;
        const requestBody = {
            query: `
                query {
                  bookings {
                    _id
                    createdAt
                    event {
                        _id
                        title
                        date
                    }
                  }
                }
              `
          };      
        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+token
            }
        }).then(function(res){
            if(!(res.status == 200 || res.status == 201)){
                console.log(res);
                throw new Error('Failed!');
            }
            return res.json();
        }).then(function(resData){
            const bookings=resData.data.bookings;
            thisObj.setState({bookings: bookings, isLoading: false});
        }).catch(function(err){
            console.log("fetch error: ", err);
            thisObj.setState({isLoading: false});
        });
    };

    render() {
        return (
            <React.Fragment>
            {this.state.isLoading ? (<Spinner />) : (
                <ul>
                    {this.state.bookings.map(function(booking){
                        return (
                            <li key={booking._id} >
                                {booking.event.title} - {' '}{new Date(booking.createdAt).toLocaleDateString()}
                            </li>
                        );
                    })}
                </ul>
            )}
            </React.Fragment>
        );
    };
}

export default BookingsPage;