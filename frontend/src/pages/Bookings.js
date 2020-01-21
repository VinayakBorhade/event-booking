import React, { Component } from 'react';
import AuthContext from '../context/auth-context';

import Spinner from '../components/Spinner/Spinner';
import BookingsList from '../components/Bookings/BookingList/BookingList';

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

    deleteBookingHandler = (bookingId) => {
        this.setState({isLoading: true});
        const token=this.context.token;
        const thisObj=this;
        const requestBody = {
            query: `
                mutation {
                  cancelBooking(bookingId: "${bookingId}") {
                    _id
                    title
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
            thisObj.setState(function(prevState){
                const updatedBooking=prevState.bookings.filter(function(booking){
                    return booking._id !== bookingId;
                });
                return {bookings: updatedBooking, isLoading: false};
            });
        }).catch(function(err){
            console.log("fetch error: ", err);
            thisObj.setState({isLoading: false});
        });
    };

    render() {
        return (
            <React.Fragment>
            {this.state.isLoading ? (<Spinner />) : (
                <BookingsList bookings={this.state.bookings} onDelete={this.deleteBookingHandler} />
            )}
            </React.Fragment>
        );
    };
}

export default BookingsPage;