# NEST-App Unit Testing Guide

Unit testing should be a part of every software's life cycle.
It ensures that the app will behave as originally planned. 
In unit testing, developers create artificial code to layout the 
schema as to how the app should behave.  
Say for example I have a class that will receive a message from the 
UAV. I will then proceed to create a UAV test suite and describe a test 
for the UAV to be 'Receive Message'. I assert that the UAV should 'receive 
a message with the format of {insert format here}'. I then go on to create
code that demonstrates what I have asserted and run a check on it with a 
simple test.
