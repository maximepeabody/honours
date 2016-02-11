
**README**
For my honours project.

**Hitchhiking/ridesharing app**
This project uses the ionic framework to build an android/ios app from
html and javascript. I use the angularjs framework for the model/view/controller,
firebase for facebook authentication, and mongodb for the database (might change later)

**Ionic **
Ionic provides a nice user interface built from css and javascript. It provides
a side menu, and a state machine to fascilitate navigation throughout the app.

**The model**
Each user has an account which is linked to facebook. A user may host a ride, where
he is the driver, or he may be a passenger to a ride. A 'myRides' page will display
all the hosted rides, the passenger rides, and previous rides, along with an option
to view more details, and to chat to the passengers/driver.

A user can create a ride, giving a origin and a destination, time and date,
spots available, price, and additional info. The google places api is used
to provide the longitude and latitude of the origin and destination. This info
is then saved to the database.

A user can search for rides by providing a date, origin and destination. This
creates a query, using the longitude and latitude so that nearby locations are
included in the results. The user may click on a result to create a request.
This will notify the driver, who may accept the passenger, which will then
add the passenger to the passenger list, and add the ride to the users ride list.


**To do**
-Create a review/rating system
-Include overlapping rides in query, for example, Toronto-Montreal includes
Toronto-Kingston, and Kingston-Montreal.
