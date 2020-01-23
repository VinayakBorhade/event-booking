import React, { Component } from 'react';
import AuthContext from '../context/auth-context';

import Spinner from '../components/Spinner/Spinner';
import BookingList from '../components/Bookings/BookingList/BookingList';
import BookingChart from '../components/Bookings/BookingChart/BookingChart';
import BookingControls from '../components/Bookings/BookingsControls/BookingsControls';

class BookingsPage extends Component {

    state={
        isLoading: false,
        bookings: [],
        outputType: 'list'
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
                        price
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
                mutation cancelBooking($id: ID!){
                  cancelBooking(bookingId: $id) {
                    _id
                    title
                  }
                }
              `,
              variables: {
                  id: bookingId
              }
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

    changeOutputTypeHandler = (outputType) => {
        if(outputType==='list'){
            this.setState({outputType: 'list'});
        }
        else{
            this.setState({outputType: 'chart'});
        }
    };

    render() {
        let content=<Spinner />;
        if(!this.state.isLoading){
            content=(
                <React.Fragment>
                    <BookingControls 
                        activeOutputType={this.state.outputType} 
                        onChange={this.changeOutputTypeHandler} 
                    />
                    <div>
                        {this.state.outputType=='list' ? 
                        (<BookingList bookings={this.state.bookings} onDelete={this.deleteBookingHandler}/>) 
                        : (<BookingChart bookings={this.state.bookings} />) }
                    </div>
                </React.Fragment>
            );
        }
        return content;
    };
}

export default BookingsPage;