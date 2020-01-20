import React from 'react';

import './EventItem.css';

const eventItem = function(props){
    return (
        <li key={props.eventId} className="events__list-item">
            <div>
                <h1>{props.title}</h1>
                <h2>Rs. {props.price} - {new Date(props.date).toLocaleDateString()}</h2>
            </div>
            <div>
                
                { props.userId==props.creatorId ? (
                    <p>You are owner</p>
                ) : (<button className="btn" >View Details</button>) }
            </div>
        </li>
    );
};

export default eventItem;