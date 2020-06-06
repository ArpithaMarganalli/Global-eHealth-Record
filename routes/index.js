/*
* GET home page.
*/

exports.index = function(request, response){
    var message = '';
    response.render('index',{message: message});
};
