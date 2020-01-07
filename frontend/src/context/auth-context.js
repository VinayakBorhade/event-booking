import React from 'react';

export default React.createContext({
    token: null,
    userId: null,
    login: function(token, userId, tokenExpiration){},
    logout: function(){}
});